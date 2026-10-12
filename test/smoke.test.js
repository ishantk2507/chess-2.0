/* Headless smoke test: loads chess.js + combat.js + ai.js in Node with a
   minimal DOM stub, then simulates full games to validate the game loop,
   party rule, combat resolution and board reversion. Run: node test/smoke.test.js */

const fs = require('fs');
const vm = require('vm');

// ---- minimal DOM/browser stubs (not strictly needed for engine files, but safe) ----
global.window = global;
global.performance = { now: () => Date.now() };

// ---- load engine scripts into this context ----
for (const f of ['js/chess.js', 'js/combat.js', 'js/ai.js']) {
  const code = fs.readFileSync(__dirname + '/../' + f, 'utf8');
  vm.runInThisContext(code, { filename: f });
}

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; } else { fail++; console.error('  ✗ FAIL:', msg); }
}

console.log('== Unit checks ==');

// 1. initial board
const board = makeInitialBoard();
assert(board[0][0].type === 'r' && board[0][0].color === 'b', 'black rook a8');
assert(board[7][3].type === 'q' && board[7][3].color === 'w', 'white queen d1');
assert(allLegalMoves(board, 'w').length === 20, 'white has 20 opening moves, got ' + allLegalMoves(board,'w').length);
assert(allLegalMoves(board, 'b').length === 20, 'black has 20 opening moves');

// 2. pawn attack geometry (diagonal only)
{
  const b2 = Array.from({length:8},()=>Array(8).fill(null));
  const wp = mkPiece('w','p',4,4); b2[4][4] = wp;
  const bp = mkPiece('b','p',3,5); b2[3][5] = bp;
  const caps = pseudoMoves(b2, wp).filter(m=>m.cap);
  assert(caps.length===1 && caps[0].r===3 && caps[0].c===5, 'pawn captures diagonally');
}

// 3. pinned piece cannot move (legality filter)
{
  const b3 = Array.from({length:8},()=>Array(8).fill(null));
  const wk = mkPiece('w','k',7,4); b3[7][4]=wk;
  const wn = mkPiece('w','n',6,4); b3[6][4]=wn;      // pinned by rook
  const br = mkPiece('b','r',2,4); b3[2][4]=br;
  assert(legalMoves(b3, wn).length === 0, 'pinned knight has 0 moves');
  assert(isInCheck(b3,'w'), 'white is in check');
}

// 4. PARTY RULE
{
  const b4 = Array.from({length:8},()=>Array(8).fill(null));
  const wp = mkPiece('w','p',4,4); b4[4][4]=wp;              // attacker
  const bp = mkPiece('b','p',3,5); b4[3][5]=bp;              // target
  const wr = mkPiece('w','r',5,5); b4[5][5]=wr;              // attacks 3,5 via e-file (4,5 empty) → joins attackers
  const bn = mkPiece('b','n',5,6); b4[5][6]=bn;              // knight jump to 4,4 → joins defenders
  const res = buildParties(b4, wp, 3, 5);
  assert(res.atkSide.includes(wp) && res.atkSide.includes(wr), 'rook joins attacker party via target square');
  assert(res.defSide.includes(bp) && res.defSide.includes(bn), 'knight joins defender party via attacker square');
  assert(res.target === bp, 'target identified');
}

// 5. Combat engine — unopposed exchange damages
{
  const b5 = makeInitialBoard();
  const wp = b5[6][4], bp = mkPiece('b','p',4,4); b5[4][4]=bp;
  const c = new Combat({board:b5, attacker:wp, target:bp, atkSide:[wp], defSide:[bp],
                        atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
  const ex = c.resolveExchange('heavy', null, null);   // no response
  assert(ex.atkDmg > 0 && c.hpD < bp.maxHp, 'unopposed heavy deals damage');
  assert(c.momentum.a >= 2, 'momentum accrues on hits');
}

// 6. Matrix logic spot checks
{
  const b6 = makeInitialBoard();
  const wp = b6[6][4], bp = b6[1][4];
  const mk = () => new Combat({board:b6, attacker:wp, target:bp, atkSide:[wp], defSide:[bp], atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
  let c = mk();
  let r = c.resolveExchange('feint','dodge','good');
  assert(r.atkDmg > 0 && c.momentum.a >= 2, 'feint punishes dodge');
  c = mk();
  r = c.resolveExchange('quick','dodge','perfect');
  assert(r.atkDmg === 0 && c.momentum.d >= 2, 'perfect dodge negates quick + resolve');
  c = mk();
  r = c.resolveExchange('heavy','block','good');
  assert(r.atkDmg > 0, 'heavy breaks block');
  c = mk();
  r = c.resolveExchange('iaijutsu','dodge','perfect');
  assert(r.atkDmg > 0, 'iaijutsu cannot be dodged');
}

// 7. Finish & consequence persistence
{
  const b7 = makeInitialBoard();
  const wp = b7[6][4], bp = b7[1][4];
  const c = new Combat({board:b7, attacker:wp, target:bp, atkSide:[wp], defSide:[bp], atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
  c.hpD = 0;
  const res = c.finish('atkWin');
  assert(res.winner==='atk' && res.captured, 'atk win → captured flag');
  assert(wp.xp === 2, 'attacker gains veteran XP');
  assert(wp.hp === Math.max(0, Math.round(c.hpA)), 'HP persists back to piece');
}

// 8. King never removed by combat
{
  const b8 = makeInitialBoard();
  const wp = b8[6][4], bk = b8[0][4];
  const c = new Combat({board:b8, attacker:wp, target:bk, atkSide:[wp], defSide:[bk], atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
  c.hpD = 0;
  const res = c.finish('atkWin');
  assert(res.kingDown === true && bk.hp === 1, 'king survives at 1 HP, kingDown flagged');
}

// 9. AI picks a legal move every turn
{
  const b9 = makeInitialBoard();
  const mv = pickAiMove(b9, 'b', 'hard');
  assert(mv && legalMoves(b9, mv.p).some(m => m.r===mv.m.r && m.c===mv.m.c), 'AI move is legal');
}

// 10. Full simulated match (AI vs AI, auto-combat resolution) — exercises the loop end-to-end
{
  console.log('== Simulated full match (AI vs AI) ==');
  const b10 = makeInitialBoard();
  let turn = 'w', engagements = 0, captures = 0, plies = 0, over = null;
  while (plies < 300 && !over) {
    plies++;
    const choice = pickAiMove(b10, turn, 'normal');
    if (!choice) { over = turn === 'w' ? 'b' : 'w'; break; }
    const { p, m } = choice;
    const originR = p.r, originC = p.c;
    const cap = m.cap;
    applyMove(b10, p, m);
    if (cap) {
      engagements++;
      const { atkSide, defSide } = buildParties(b10, p, m.r, m.c);
      const c = new Combat({board:b10, attacker:p, target:cap, atkSide, defSide,
                            atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
      let guard = 0;
      while (!c.checkEnd() && guard++ < 20) {
        const atkMove = aiAttackMove(c, AI_LEVELS.normal);
        if (atkMove === 'retreat') { c.disengage('atk'); break; }
        if (atkMove === 'finisher') { c.useFinisher(); continue; }
        const d = aiDefend(c, AI_LEVELS.hard);
        c.resolveExchange(atkMove, d.resp, d.quality);
      }
      const res = c.checkEnd() || c.finish('draw');
      if (res.kingDown) over = res.winner==='atk' ? p.color : cap.color;
      if (res.winner==='atk' && res.captured) {
        // attacker occupies the square already; dead object detached automatically
        captures++;
      } else if (res.winner==='def' && res.atkDead) {
        b10[p.r][p.c] = cap; cap.r = p.r; cap.c = p.c;   // defender holds the square
      } else {
        // revert to origin (retreat / repelled-survive / draw / disengage)
        if (b10[originR][originC] === null || b10[originR][originC] === p) {
          b10[p.r][p.c] = null; p.r = originR; p.c = originC; b10[originR][originC] = p;
        }
      }
    }
    if (!findKing(b10,'w')) { over='b'; break; }
    if (!findKing(b10,'b')) { over='w'; break; }
    const nxt = turn==='w'?'b':'w';
    if (!allLegalMoves(b10, nxt).length) { over = isInCheck(b10,nxt) ? (nxt==='w'?'b':'w') : 'draw'; break; }
    turn = nxt;
    for (const row of b10) for (const pp of row) if (pp && pp.hp>0 && pp.hp<pp.maxHp) pp.hp = Math.min(pp.maxHp, pp.hp+1);
  }
  console.log(`  plies=${plies} engagements=${engagements} captures=${captures} result=${over||'unfinished'}`);
  assert(engagements > 0, 'simulated match produced engagements');
  let counts = { w:0, b:0 }, coordOK = true;
  for (let r=0;r<8;r++) for (let cc=0;cc<8;cc++) {
    const pp = b10[r][cc];
    if (pp) { counts[pp.color]++; if (pp.r!==r || pp.c!==cc) { coordOK=false; console.error(`coord mismatch ${r},${cc} vs ${pp.r},${pp.c}`);} }
  }
  assert(coordOK, 'all piece coordinates consistent after full match');
  assert(counts.w <= 16 && counts.b <= 16, 'piece counts sane');
  assert(findKing(b10,'w') && findKing(b10,'b'), 'both kings still on board (never captured outright)');
}

// 11. Balance probe: random-play pawn duels — both sides should win sometimes
{
  let wWins = 0, dWins = 0, draws = 0;
  for (let i=0;i<400;i++){
    const b = makeInitialBoard();
    const wp = mkPiece('w','p',4,4), bp = mkPiece('b','p',3,4);
    const c = new Combat({board:b, attacker:wp, target:bp, atkSide:[wp], defSide:[bp], atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
    c.runSupportPhase();
    let guard=0;
    while(!c.checkEnd() && guard++<20){
      const atk = ['quick','heavy','feint'][Math.floor(Math.random()*3)];
      const resp = ['dodge','block','counter'][Math.floor(Math.random()*3)];
      const qual = ['perfect','good','late'][Math.floor(Math.random()*3)];
      c.resolveExchange(atk, resp, qual);
      if (c.momentum.a>=3) c.useFinisher();
    }
    const res = c.checkEnd();
    if (res.winner==='atk') wWins++; else if (res.winner==='def') dWins++; else draws++;
  }
  console.log(`  pawn duel RNG balance: atkWins=${wWins} defWins=${dWins} other=${draws}`);
  assert(wWins > 20 && wWins < 395 && dWins >= 3, 'attacker tempo wins most random-play duels, but defense can still triumph');
}

// 12. Support cap: parties never exceed 4
{
  const b = Array.from({length:8},()=>Array(8).fill(null));
  const wp = mkPiece('w','p',4,4); b[4][4]=wp;
  const bp = mkPiece('b','p',3,5); b[3][5]=bp;
  b[7][7]=mkPiece('w','q',7,7); b[7][1]=mkPiece('w','q',7,1); b[5][5]=mkPiece('w','r',5,5); b[0][5]=mkPiece('w','r',0,5);
  const res = buildParties(b, wp, 3, 5);
  assert(res.atkSide.length<=4 && res.defSide.length<=4, 'parties capped at 4');
}

// 13. Position advantage matters (README balance principle): 3v1 beats 1v3 more often
{
  function duelSim(atkPartyExtra, defPartyExtra) {
    let wins = 0;
    for (let i=0;i<200;i++){
      const b = makeInitialBoard();
      const wp = mkPiece('w','p',4,4), bp = mkPiece('b','p',3,4);
      const atkSide=[wp], defSide=[bp];
      for (let k=0;k<atkPartyExtra;k++){ const s = mkPiece('w','n',6,6+k); atkSide.push(s); }
      for (let k=0;k<defPartyExtra;k++){ const s = mkPiece('b','n',1,6+k); defSide.push(s); }
      const c = new Combat({board:b, attacker:wp, target:bp, atkSide:atkSide.slice(0,4), defSide:defSide.slice(0,4), atkSet:SETS.samurai, defSet:SETS.shinobi}, {});
      c.runSupportPhase();
      let guard=0;
      while(!c.checkEnd() && guard++<20){
        const atk = ['quick','heavy','feint'][Math.floor(Math.random()*3)];
        const resp = ['dodge','block','counter'][Math.floor(Math.random()*3)];
        const qual = ['good','good','late'][Math.floor(Math.random()*3)];
        c.resolveExchange(atk, resp, qual);
        if (c.momentum.a>=3) c.useFinisher();
      }
      if (c.checkEnd().winner==='atk') wins++;
    }
    return wins/200;
  }
  const strong = duelSim(3,0), even = duelSim(0,0), weak = duelSim(0,3);
  console.log(`  party advantage: 4v1=${(strong*100).toFixed(0)}%  1v1=${(even*100).toFixed(0)}%  1v4=${(weak*100).toFixed(0)}%`);
  assert(strong > even && even > weak, 'party size scales win rate both directions (position matters)');
  assert(strong <= 0.99, 'numerical superiority is not an automatic win');
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
