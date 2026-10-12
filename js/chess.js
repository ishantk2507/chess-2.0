/* ============================================================
   chess.js — core chess logic + piece RPG stats + party rules
   (hand-rolled for the prototype; standard algebraic coordinates)
   ============================================================ */

const GLYPH = { k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' };
const PIECE_NAME = { k:'King', q:'Queen', r:'Rook', b:'Bishop', n:'Knight', p:'Pawn' };
const PIECE_VALUE = { p:1, n:3, b:3, r:5, q:9, k:0 };

/* ---------------- Piece RPG base stats (balanced per README) ----------------
   Chess value is NOT mirrored 1:1 into raw power. Each piece has an identity:
   Pawn   - cheap, tanky-ish, builds veteran XP (promotion threat)
   Knight - burst + high dodge (evasive)
   Bishop - support / status effects (lower direct dmg, applies debuffs)
   Rook   - heavy armor, blocks well, slow (high defense)
   Queen  - versatile, high momentum generation
   King   - decisive: damage to king decides match. Strong but limited kit.
----------------------------------------------------------------------------- */
const BASE_STATS = {
  p: { hp: 60,  atk: 12, def: 6,  spd: 2 },
  n: { hp: 75,  atk: 16, def: 6,  spd: 4 },
  b: { hp: 70,  atk: 14, def: 6,  spd: 3 },
  r: { hp: 100, atk: 18, def: 12, spd: 1 },
  q: { hp: 110, atk: 22, def: 9,  spd: 4 },
  k: { hp: 140, atk: 20, def: 10, spd: 2 },
};

/* ---------------- Board helpers ---------------- */
function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function sqName(r, c) { return 'abcdefgh'[c] + (8 - r); }

function makeInitialBoard() {
  const back = ['r','n','b','q','k','b','n','r'];
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = mkPiece('b', back[c], 0, c);
    board[1][c] = mkPiece('b', 'p', 1, c);
    board[6][c] = mkPiece('w', 'p', 6, c);
    board[7][c] = mkPiece('w', back[c], 7, c);
  }
  return board;
}

let _uid = 1;
function mkPiece(color, type, r, c) {
  const st = BASE_STATS[type];
  return {
    id: _uid++, color, type, r, c,
    moved: false,
    hp: st.hp, maxHp: st.hp, atk: st.atk, def: st.def,
    xp: 0,               // roguelike-lite: veteran bonuses from survived combats
    statuses: [],        // [{key:'poison'|'fatigue'|'exposed'|'wound', turns}]
  };
}

function getPiece(board, r, c) { return inBounds(r, c) ? board[r][c] : undefined; }

/* ---------------- Attack map (who threatens which square) ----------------
   Returns map: "r,c" -> array of pieces that directly attack that square.
   Uses classic chess geometry; pawns attack diagonally only.
   En-passant & castling intentionally omitted from this prototype. */
const DIRS = {
  n: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
  b: [[-1,-1],[-1,1],[1,-1],[1,1]],
  r: [[-1,0],[1,0],[0,-1],[0,1]],
  k: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
};

function pawnAttackTargets(p) {
  const dr = p.color === 'w' ? -1 : 1;
  return [[p.r + dr, p.c - 1], [p.r + dr, p.c + 1]];
}

/* Ray directions for a piece type (sliding or single-step). */
function rayDirs(type) {
  if (type === 'n') return DIRS.n.map(d => ({ dr: d[0], dc: d[1], slide: false }));
  if (type === 'b') return DIRS.b.map(d => ({ dr: d[0], dc: d[1], slide: true }));
  if (type === 'r') return DIRS.r.map(d => ({ dr: d[0], dc: d[1], slide: true }));
  if (type === 'q') return DIRS.b.concat(DIRS.r).map(d => ({ dr: d[0], dc: d[1], slide: true }));
  if (type === 'k') return DIRS.k.map(d => ({ dr: d[0], dc: d[1], slide: false }));
  return [];
}

/* Does the piece at (r,c) ATTACK square (tr,tc)? Geometric check along the line
   between them — the occupying piece itself never blocks its own square, so pins
   are detected correctly (a rook attacks the knight in front of the enemy king). */
function pieceAttacksSquare(board, r, c, tr, tc) {
  const p = board[r][c];
  if (!p) return false;
  const dr = tr - r, dc = tc - c;
  if (p.type === 'p') {
    const pr = p.color === 'w' ? -1 : 1;
    return dr === pr && Math.abs(dc) === 1;
  }
  if (p.type === 'n') return (Math.abs(dr) === 1 && Math.abs(dc) === 2) || (Math.abs(dr) === 2 && Math.abs(dc) === 1);
  for (const ray of rayDirs(p.type)) {
    if (dr * ray.dc !== dc * ray.dr) continue;          // not on this ray
    if (Math.sign(dr || dc) !== Math.sign(ray.dr || ray.dc)) continue;
    if (!ray.slide) return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    let rr = r + ray.dr, cc = c + ray.dc;
    while (rr !== tr || cc !== tc) {
      if (board[rr][cc]) return false;                  // an intervening piece blocks the ray
      rr += ray.dr; cc += ray.dc;
    }
    return true;                                        // clear line to target square
  }
  return false;
}

/* All pieces of `color` attacking square (tr,tc). */
function attackersOf(board, tr, tc, color) {
  const list = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p && p.color === color && !(r === tr && c === tc) && pieceAttacksSquare(board, r, c, tr, tc)) list.push(p);
  }
  return list;
}

/* ---------------- Legal moves ---------------- */
function pseudoMoves(board, p) {
  const out = [];
  const push = (r, c) => {
    if (!inBounds(r, c)) return false;
    const t = board[r][c];
    if (!t) { out.push({ r, c, cap: null }); return true; }
    if (t.color !== p.color) out.push({ r, c, cap: t });
    return false; // occupied: sliding pieces stop
  };
  if (p.type === 'p') {
    const dr = p.color === 'w' ? -1 : 1;
    const startRow = p.color === 'w' ? 6 : 1;
    if (!getPiece(board, p.r + dr, p.c)) {
      out.push({ r: p.r + dr, c: p.c, cap: null });
      if (p.r === startRow && !board[p.r + 2 * dr][p.c]) out.push({ r: p.r + 2 * dr, c: p.c, cap: null });
    }
    for (const [rr, cc] of pawnAttackTargets(p)) {
      const t = getPiece(board, rr, cc);
      if (t && t.color !== p.color) out.push({ r: rr, c: cc, cap: t });
    }
  } else if (p.type === 'n' || p.type === 'k') {
    for (const [dr, dc] of DIRS[p.type]) push(p.r + dr, p.c + dc);
  } else {
    const dirs = p.type === 'b' ? DIRS.b : p.type === 'r' ? DIRS.r : DIRS.b.concat(DIRS.r);
    for (const [dr, dc] of dirs) {
      let rr = p.r + dr, cc = p.c + dc;
      while (inBounds(rr, cc)) { if (!push(rr, cc)) break; rr += dr; cc += dc; }
    }
  }
  return out;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p && p.type === 'k' && p.color === color) return p;
  }
  return null;
}

function isInCheck(board, color) {
  const k = findKing(board, color);
  if (!k) return false;
  const opp = color === 'w' ? 'b' : 'w';
  return attackersOf(board, k.r, k.c, opp).length > 0;
}

function legalMoves(board, p) {
  const res = [];
  for (const m of pseudoMoves(board, p)) {
    const savedFrom = [p.r, p.c], savedCap = board[m.r][m.c];
    board[p.r][p.c] = null; board[m.r][m.c] = p;
    const bad = isInCheck(board, p.color);
    board[m.r][m.c] = savedCap; board[p.r][p.c] = p;
    p.r = savedFrom[0]; p.c = savedFrom[1];
    if (!bad) res.push(m);
  }
  return res;
}

function allLegalMoves(board, color) {
  const list = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p && p.color === color) for (const m of legalMoves(board, p)) list.push({ p, m });
  }
  return list;
}

/* ---------------- THE PARTY RULE (core differentiator) ----------------
   When A attacks B:
     attacker side = A + every allied piece that directly attacks B's square
     defender side = B + every enemy piece that directly attacks A's CURRENT square
   Supports participate with restricted roles (see combat.js). */
function buildParties(board, attacker, targetR, targetC) {
  const target = board[targetR][targetC];
  const defColor = target.color;
  const atkSide = [attacker];
  for (const p of attackersOf(board, targetR, targetC, attacker.color)) {
    if (p.id !== attacker.id && !atkSide.includes(p)) atkSide.push(p);
  }
  const defSide = [target];
  for (const p of attackersOf(board, attacker.r, attacker.c, defColor)) {
    if (p.id !== target.id && !defSide.includes(p)) defSide.push(p);
  }
  // cap parties at 4 (primary + 3 supports) to keep fights short — README rule
  return { atkSide: atkSide.slice(0, 4), defSide: defSide.slice(0, 4), target };
}

/* ---------------- Move application ---------------- */
// captures never auto-resolve — they open an engagement (see main.js)
function applyMove(board, p, mv) {
  board[p.r][p.c] = null;
  p.r = mv.r; p.c = mv.c;
  board[mv.r][mv.c] = p;
  p.moved = true;
}

function promotePiece(p, type) {
  const st = BASE_STATS[type];
  const hpRatio = p.hp / p.maxHp;
  p.type = type;
  p.maxHp = st.hp; p.atk = st.atk; p.def = st.def;
  p.hp = Math.max(1, Math.round(st.hp * hpRatio));
}

/* ---------------- Status helpers ---------------- */
function hasStatus(p, key) { return p.statuses.some(s => s.key === key); }
function addStatus(p, key, turns) {
  const ex = p.statuses.find(s => s.key === key);
  if (ex) ex.turns = Math.max(ex.turns, turns);
  else p.statuses.push({ key, turns });
}
function tickStatuses(p) {
  p.statuses.forEach(s => s.turns--);
  p.statuses = p.statuses.filter(s => s.turns > 0);
}

/* Effective stat modifiers fed back into combat (chess ⇄ RPG coupling) */
function effAtk(p) {
  let a = p.atk;
  if (hasStatus(p, 'fatigue')) a *= 0.8;
  if (hasStatus(p, 'wound')) a *= 0.85;
  if (p.xp >= 3) a *= 1.1;   // Veteran + (earned by surviving winning combats)
  if (p.xp >= 6) a *= 1.1;   // Elite +
  return a;
}
function effDef(p) {
  let d = p.def;
  if (hasStatus(p, 'exposed')) d *= 0.7;
  if (p.xp >= 3) d *= 1.05;
  return d;
}
function hpFactor(p) { return 0.55 + 0.45 * (p.hp / p.maxHp); } // wounded pieces hit weaker
