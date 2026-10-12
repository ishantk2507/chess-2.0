/* ============================================================
   ai.js — chess-move AI + combat AI (difficulty-scaled)
   Balancing rule from README: better chess position ⇒ better
   combat odds, but a skilled human defender can still outplay.
   ============================================================ */

const AI_LEVELS = {
  easy:   { depth: 1, defendSkill: 0.30, attackMix: [0.5, 0.2, 0.3], engageBias: 1.25, blunder: 0.30 },
  normal: { depth: 2, defendSkill: 0.55, attackMix: [0.34, 0.33, 0.33], engageBias: 1.0,  blunder: 0.08 },
  hard:   { depth: 2, defendSkill: 0.78, attackMix: [0.3, 0.4, 0.3],  engageBias: 0.85, blunder: 0.0  },
};

/* ---- Board evaluation: material + HP-weighted + positional-lite ---- */
/* attacked-by-color map: "r,c" -> count of enemy attackers of that square */
function attackedBy(board, color) {
  const m = {};
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c]) continue;                        // empty squares only matter as pressure; occupied handled below
  }
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c]; if (!p || p.color !== color) continue;
    for (const ray of rayDirs(p.type)) {
      let rr = r + ray.dr, cc = c + ray.dc;
      while (inBounds(rr, cc)) {
        m[rr + ',' + cc] = (m[rr + ',' + cc] || 0) + 1;
        if (!ray.slide) break;
        if (board[rr][cc]) break;                     // blocked beyond first piece
        rr += ray.dr; cc += ray.dc;
      }
    }
    if (p.type === 'p') for (const [rr, cc] of pawnAttackTargets(p)) if (inBounds(rr, cc)) m[rr + ',' + cc] = (m[rr + ',' + cc] || 0) + 1;
  }
  return m;
}

function evaluateBoard(board) {
  let score = 0; // + good for white
  const atkW = attackedBy(board, 'w'), atkB = attackedBy(board, 'b');
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (!p) continue;
    let v = PIECE_VALUE[p.type] * 100;
    v += (p.hp / p.maxHp - 0.5) * 40 * PIECE_VALUE[p.type];   // wounded pieces worth less
    v += Math.min(p.xp, 6) * 6;                               // veterans slightly better
    // center control bonus
    const centr = (3.5 - Math.abs(3.5 - c)) + (3.5 - Math.abs(3.5 - r));
    v += centr * 3;
    if (p.type === 'p') v += (p.color === 'w' ? (6 - r) : (r - 1)) * 8; // pawn advance
    const key = r + ',' + c;
    const mine = p.color === 'w' ? atkW : atkB;
    const theirs = p.color === 'w' ? atkB : atkW;
    v += (mine[key] || []).length * 4;         // defended
    v -= (theirs[key] || []).length * 6;       // threatened (engagements are risky!)
    score += p.color === 'w' ? v : -v;
  }
  return score;
}

/* Simulate engagement outcome heuristically for move scoring */
function simEngagement(board, attacker, target, level) {
  const { atkSide, defSide } = buildParties(board, attacker, target.r, target.c);
  // party power: primary full + supports as restricted buffs (NOT raw bodies)
  const pow = (side, primary) => {
    let s = effAtk(primary) * hpFactor(primary) * (primary.hp / primary.maxHp + 0.5);
    let n = 0;
    side.forEach(p => { if (p.id !== primary.id) { n++; s *= (n === 1 ? 1.14 : n === 2 ? 1.07 : 1.03); } }); // diminishing support value
    return s;
  };
  const a = pow(atkSide, attacker), d = pow(defSide, target);
  const ratio = a / (a + d);                    // 0..1 attacker win chance
  const val = PIECE_VALUE[target.type] * 100;
  // expected value of engaging: win→capture, lose→attacker wounded/lost
  const ev = ratio * val - (1 - ratio) * (PIECE_VALUE[attacker.type] * 60 + 40);
  return ev * level.engageBias;
}

function pickAiMove(board, color, levelKey) {
  const level = AI_LEVELS[levelKey];
  const moves = allLegalMoves(board, color);
  if (!moves.length) return null;
  let best = null, bestScore = -Infinity;
  for (const { p, m } of moves) {
    // shallow clone-free eval: apply, score, undo
    const fromR = p.r, fromC = p.c, cap = m.cap;
    board[fromR][fromC] = null; board[m.r][m.c] = p; p.r = m.r; p.c = m.c;
    let s = color === 'w' ? evaluateBoard(board) : -evaluateBoard(board);
    if (cap) s += simEngagement(board, p, cap, level);
    if (isInCheck(board, cap ? cap.color : (color === 'w' ? 'b' : 'w'))) s += 30;
    board[m.r][m.c] = cap || null; board[fromR][fromC] = p; p.r = fromR; p.c = fromC;
    if (level.blunder > 0 && Math.random() < level.blunder) s -= 150 + Math.random() * 250;
    if (s > bestScore) { bestScore = s; best = { p, m }; }
  }
  return best;
}

/* ---- Combat AI ---- */
// Defender response when CPU is defending (timing simulated by skill roll)
function aiDefend(combat, level) {
  const skill = level.defendSkill;
  const roll = Math.random();
  // choose response vs likely attack: mix it up
  const respPool = ['dodge', 'block', 'counter'];
  let resp = respPool[Math.floor(Math.random() * 3)];
  // smarter: if enemy momentum high & hp low → block; if shinobi → dodge more
  if (combat.defSet.name === 'Shinobi' && roll < 0.5) resp = 'dodge';
  if (combat.hpD / combat.target.maxHp < 0.3 && roll < 0.5) resp = 'block';
  let quality = 'good';
  const q = Math.random();
  if (q < skill * 0.45) quality = 'perfect';
  else if (q > 1 - skill * 0.25) quality = 'late';
  return { resp, quality };
}

// Attacker move choice for CPU
function aiAttackMove(combat, level) {
  const mix = level.attackMix;
  const r = Math.random();
  let mv = r < mix[0] ? 'quick' : r < mix[0] + mix[1] ? 'heavy' : 'feint';
  // ability usage: spend momentum on signature ability when available
  const ab = combat.atkSet.abilities.primary[0];
  if (combat.momentum.a >= ab.cost && Math.random() < 0.6 + level.defendSkill * 0.2) mv = ab.key;
  // finisher whenever possible
  if (combat.momentum.a >= 3 && Math.random() < 0.7 + level.defendSkill * 0.3) mv = 'finisher';
  // disengage if badly losing and hard AI
  const losing = (combat.hpA / combat.attacker.maxHp) < 0.25 && combat.hpA < combat.hpD * 0.5;
  if (losing && level.defendSkill > 0.5 && combat.exchange >= 2 && Math.random() < 0.5) mv = 'retreat';
  return mv;
}
