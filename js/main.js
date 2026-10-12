/* ============================================================
   main.js — UI, game loop orchestration, combat presentation
   Loop: Chess move → engagement (if capture) → consequences → next move
   ============================================================ */

const $ = (id) => document.getElementById(id);

const state = {
  board: null,
  turn: 'w',
  mode: 'ai',            // 'ai' | 'hotseat'
  diff: 'normal',
  selected: null,
  legalForSelected: [],
  busy: false,           // input lock (animations / AI thinking)
  gameOver: false,
  sets: { w: SETS.samurai, b: SETS.shinobi },
};

/* ================= MENU ================= */
document.querySelectorAll('#modeGroup .opt').forEach(b => b.onclick = () => {
  document.querySelectorAll('#modeGroup .opt').forEach(x => x.classList.remove('selected'));
  b.classList.add('selected'); state.mode = b.dataset.mode;
  $('diffGroup').style.opacity = state.mode === 'ai' ? 1 : 0.35;
});
document.querySelectorAll('#diffGroup .opt').forEach(b => b.onclick = () => {
  document.querySelectorAll('#diffGroup .opt').forEach(x => x.classList.remove('selected'));
  b.classList.add('selected'); state.diff = b.dataset.diff;
});
$('startBtn').onclick = () => { $('menu').classList.remove('active'); $('game').classList.add('active'); newGame(); };
$('resignBtn').onclick = () => endMatch(state.turn === 'w' ? 'b' : 'w', 'Resignation');

function newGame() {
  _uid = 1;
  state.board = makeInitialBoard();
  state.turn = 'w'; state.gameOver = false; state.selected = null;
  $('log').innerHTML = '';
  logMsg('Match started. White (Samurai) to move.', 'sys');
  logMsg('Tip: hovering a piece previews its battle party on captures.', 'sys');
  renderAll();
}

/* ================= LOGGING ================= */
function logMsg(txt, cls = '') {
  const d = document.createElement('div');
  d.className = cls; d.innerHTML = txt;
  $('log').appendChild(d); $('log').scrollTop = $('log').scrollHeight;
}

/* ================= BOARD RENDER ================= */
const boardEl = $('board');
const squares = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
  const sq = document.createElement('div');
  sq.className = 'sq ' + ((r + c) % 2 ? 'dark' : 'light');
  sq.dataset.r = r; sq.dataset.c = c;
  boardEl.appendChild(sq);
  squares.push(sq);
}
function sqEl(r, c) { return squares[r * 8 + c]; }

function renderBoard() {
  const b = state.board;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const el = sqEl(r, c);
    el.innerHTML = '';
    el.classList.remove('sel', 'move', 'capmove', 'influence-atk', 'influence-def', 'check');
    const p = b[r][c];
    if (!p) continue;
    const g = document.createElement('div');
    g.className = 'piece ' + (p.color === 'w' ? 'wpc' : 'bpc');
    g.textContent = GLYPH[p.type];
    el.appendChild(g);
    // HP bar
    const ratio = p.hp / p.maxHp;
    if (ratio < 1 || p.statuses.length || p.xp > 0) {
      const bar = document.createElement('div'); bar.className = 'hpbar';
      const fill = document.createElement('div');
      fill.className = 'hpfill ' + (ratio < 0.34 ? 'low' : ratio < 0.7 ? 'mid' : '');
      fill.style.width = Math.round(ratio * 100) + '%';
      bar.appendChild(fill); el.appendChild(bar);
    }
    // status chips
    if (p.statuses.length) {
      const chips = document.createElement('div'); chips.className = 'statchips';
      const ICON = { poison: '☠', fatigue: '💤', exposed: '💔', wound: '🩸', adrenaline: '🔥' };
      p.statuses.forEach(s => {
        const ch = document.createElement('span'); ch.className = 'chip';
        ch.textContent = ICON[s.key] || '?'; ch.title = s.key;
        chips.appendChild(ch);
      });
      el.appendChild(chips);
    }
    if (p.xp >= 3) { const v = document.createElement('div'); v.className = 'vet'; v.textContent = '★'; v.title = `Veteran XP ${p.xp}`; el.appendChild(v); }
  }
  // check highlight
  if (isInCheck(b, state.turn)) {
    const k = findKing(b, state.turn);
    if (k) sqEl(k.r, k.c).classList.add('check');
  }
  // selection overlay
  if (state.selected) {
    const p = state.selected;
    if (b[p.r][p.c] === p) {
      sqEl(p.r, p.c).classList.add('sel');
      for (const m of state.legalForSelected) {
        sqEl(m.r, m.c).classList.add(m.cap ? 'capmove' : 'move');
      }
      // influence preview: if selected piece attacks target square, show parties
    }
  }
  updateEvalBar();
  updateSidePanels();
}

function updateEvalBar() {
  const e = evaluateBoard(state.board);
  const pct = 50 + Math.max(-45, Math.min(45, e / 60));
  $('evalBar').style.width = pct + '%';
}

function updateSidePanels() {
  for (const color of ['w', 'b']) {
    const el = $(color === 'w' ? 'whiteInfo' : 'blackInfo');
    let alive = 0, lost = 0, wounded = 0, vets = 0, hpSum = 0, hpMax = 0;
    for (const row of state.board) for (const p of row) if (p && p.color === color) {
      alive++; hpSum += p.hp; hpMax += p.maxHp;
      if (p.hp < p.maxHp) wounded++;
      if (p.xp >= 3) vets++;
    }
    lost = 16 - alive;
    el.innerHTML =
      `<span class="alive">Pieces:</span> ${alive}/16 &nbsp; (${lost} eliminated)<br>` +
      `<span class="alive">Total HP:</span> ${Math.round(hpSum)}/${hpMax}<br>` +
      `Wounded: ${wounded} · Veterans★: ${vets}<br>` +
      `Set: ${state.sets[color].name} — <i>${state.sets[color].passiveDesc}</i>`;
  }
  // statuses summary
  const list = [];
  for (const row of state.board) for (const p of row) if (p && p.statuses.length) {
    list.push(`${p.color === 'w' ? '♙' : '♟'}${PIECE_NAME[p.type]}@${sqName(p.r,p.c)}: ` +
      p.statuses.map(s => s.key).join(', '));
  }
  $('statusList').innerHTML = list.length ? list.join('<br>') : 'No active statuses.';
  $('turnBanner').textContent = state.turn === 'w' ? "White's turn (Samurai)" : "Black's turn (Shinobi)";
  $('turnBanner').className = 'turn-banner ' + (state.turn === 'w' ? 'white' : 'black');
}

/* ================= INFLUENCE PREVIEW ================= */
function previewFor(p) {
  const prev = $('preview');
  if (!p) { prev.innerHTML = 'Select a piece to preview who would join its battles.'; return; }
  const b = state.board;
  // squares this piece can capture right now
  const caps = pseudoMoves(b, p).filter(m => m.cap);
  if (!caps.length) {
    prev.innerHTML = `<b>${PIECE_NAME[p.type]}</b> has no direct attacks available from here.<br>` +
      `<span class="sys" style="color:#8a96ad">Move it to threaten enemy pieces — the attack graph builds your party.</span>`;
    clearInfluenceHighlights();
    return;
  }
  let html = `<b>${PIECE_NAME[p.type]}</b> — capture previews:<br>`;
  clearInfluenceHighlights();
  for (const m of caps.slice(0, 3)) {
    const { atkSide, defSide } = buildParties(b, p, m.r, m.c);
    html += `<div style="margin:6px 0;padding:6px;background:#1c2333;border-radius:8px;">` +
      `vs ♟${PIECE_NAME[m.cap.type]}@${sqName(m.r,m.c)}:<br>` +
      `<span class="atk-side">YOURS (${atkSide.length}):</span> ` + atkSide.map(x => GLYPH[x.type]).join(' ') + '<br>' +
      `<span class="def-side">THEIRS (${defSide.length}):</span> ` + defSide.map(x => GLYPH[x.type]).join(' ') + '</div>';
    sqEl(m.r, m.c).classList.add('influence-atk');
    for (const s of defSide) sqEl(s.r, s.c).classList.add('influence-def');
  }
  prev.innerHTML = html;
}
function clearInfluenceHighlights() {
  squares.forEach(s => s.classList.remove('influence-atk', 'influence-def'));
}

/* ================= INPUT ================= */
boardEl.addEventListener('click', (e) => {
  if (state.busy || state.gameOver) return;
  if (state.mode === 'ai' && state.turn === 'b') return;   // CPU thinking
  const sq = e.target.closest('.sq');
  if (!sq) return;
  const r = +sq.dataset.r, c = +sq.dataset.c;
  const p = state.board[r][c];
  if (state.selected && state.legalForSelected.some(m => m.r === r && m.c === c)) {
    const mv = state.legalForSelected.find(m => m.r === r && m.c === c);
    tryHumanPromotion(state.selected, mv, () => doPlayerMove(state.selected, mv));
    return;
  }
  if (p && p.color === state.turn) {
    state.selected = p;
    state.legalForSelected = legalMoves(state.board, p);
    renderBoard();
    previewFor(p);
    $('hint').textContent = `${PIECE_NAME[p.type]} selected — HP ${p.hp}/${p.maxHp}, ATK ${Math.round(effAtk(p))}. Click a highlighted square to move (red ring = capture → triggers an engagement!).`;
  } else {
    state.selected = null; state.legalForSelected = [];
    renderBoard(); previewFor(null);
  }
});

boardEl.addEventListener('mouseover', (e) => {
  if (state.busy || state.gameOver || state.selected) return;
  const sq = e.target.closest('.sq'); if (!sq) return;
  const p = state.board[+sq.dataset.r][+sq.dataset.c];
  if (p) previewFor(p);
});
boardEl.addEventListener('mouseleave', () => { if (!state.selected) { clearInfluenceHighlights(); $('preview').innerHTML = 'Hover/select a piece to preview battle parties.'; } });

/* Promotion: RPG-flavoured choice (chess identity still queen/rook/bishop/knight) */
function tryHumanPromotion(p, mv, then) {
  const promoRow = p.color === 'w' ? 0 : 7;
  if (p.type !== 'p' || mv.r !== promoRow) return then();
  const choices = [
    { t: 'q', label: '👑 Queen — Shogun/Kunoichi (versatile, momentum)' },
    { t: 'r', label: '🏯 Rook — Guardian/Iron Gate (defense, shields)' },
    { t: 'n', label: '🐎 Knight — Rider/Assassin (burst, dodge)' },
    { t: 'b', label: '🔮 Bishop — Onmyoji/Ninjutsu (hexes, support)' },
  ];
  showChoice(`⚔ PROMOTION! Choose ${p.color === 'w' ? 'Samurai' : 'Shinobi'} path:`, choices.map(c => c.label), (idx) => {
    promotePiece(p, choices[idx].t);
    logMsg(`Pawn promotes → <b>${PIECE_NAME[choices[idx].t]}</b> (${state.sets[p.color].name} branch)!`, 'good');
    then();
  });
}

function showChoice(title, options, cb) {
  $('resultTitle').textContent = title;
  const box = $('resultText'); box.innerHTML = '';
  options.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'act ability'; btn.style.display = 'block'; btn.style.margin = '8px auto';
    btn.style.width = '100%'; btn.textContent = o;
    btn.onclick = () => { hideModal(); cb(i); };
    box.appendChild(btn);
  });
  $('resultBtn').classList.add('hidden');
  $('resultModal').classList.remove('hidden');
}
function showModal(title, text, okLabel = 'OK', cb = null) {
  $('resultTitle').textContent = title;
  $('resultText').innerHTML = text;
  $('resultBtn').classList.remove('hidden');
  $('resultBtn').textContent = okLabel;
  $('resultBtn').onclick = () => { hideModal(); if (cb) cb(); };
  $('resultModal').classList.remove('hidden');
}
function hideModal() { $('resultModal').classList.add('hidden'); }

/* ================= TURN FLOW ================= */
async function doPlayerMove(p, mv) {
  state.selected = null; state.legalForSelected = [];
  await executeMove(p, mv);
  if (!state.gameOver) nextTurn();
}

function nextTurn() {
  // gentle regen + status decay each full turn cycle (RPG→chess feedback easing)
  for (const row of state.board) for (const pp of row) if (pp) {
    if (pp.hp > 0 && pp.hp < pp.maxHp && !hasStatus(pp, 'poison')) pp.hp = Math.min(pp.maxHp, pp.hp + 1);
    tickStatuses(pp);
  }
  state.turn = state.turn === 'w' ? 'b' : 'w';
  renderAll();
  checkMatchEndConditions();
  if (state.gameOver) return;
  if (state.mode === 'ai' && state.turn === 'b') aiTurn();
}

async function aiTurn() {
  state.busy = true;
  $('hint').textContent = 'CPU (Shinobi) is plotting…';
  await sleep(500 + Math.random() * 500);
  const choice = pickAiMove(state.board, 'b', state.diff);
  if (!choice) { endMatch('w', 'Black has no moves'); state.busy = false; return; }
  logMsg(`<span class="b">Black</span> ${PIECE_NAME[choice.p.type]} ${sqName(choice.p.r, choice.p.c)} → ${sqName(choice.m.r, choice.m.c)}${choice.m.cap ? ' ⚔ ENGAGES!' : ''}`);
  await executeMove(choice.p, choice.m);
  state.busy = false;
  if (!state.gameOver) nextTurn();
}

async function executeMove(p, mv) {
  const b = state.board;
  const wasCapture = !!mv.cap;
  mv.originR = p.r; mv.originC = p.c;      // needed for retreat/repel reversion
  applyMove(b, p, mv);
  renderAll();

  if (!wasCapture) {
    if (isInCheck(b, p.color === 'w' ? 'b' : 'w')) logMsg(`<span class="${p.color === 'w' ? 'w' : 'b'}">${shortName(p)}</span> gives check!`, 'bad');
    return;
  }
  // ---- CAPTURE → ENGAGEMENT ----
  const target = mv.cap;
  const { atkSide, defSide } = buildParties(b, p, mv.r, mv.c);
  logMsg(`⚔ <b>ENGAGEMENT</b> at ${sqName(mv.r, mv.c)} — ${shortName(p)} attacks ${shortName(target)}`, 'sys');
  const aiControlsBlack = (state.mode === 'ai');
  const result = await runCombatUI({
    board: b, attacker: p, target, atkSide, defSide,
    atkSet: state.sets[p.color], defSet: state.sets[target.color],
    attackerIsHuman: !(aiControlsBlack && p.color === 'b'),
    defenderIsHuman: !(aiControlsBlack && target.color === 'b'),
  });
  resolveEngagementOnBoard(p, target, mv, result);
  renderAll();
}

function resolveEngagementOnBoard(attacker, target, mv, res) {
  const b = state.board;
  if (res.kingDown) { endMatch(res.winner === 'atk' ? attacker.color : target.color, 'King defeated in combat!'); return; }
  if (res.winner === 'atk' && res.captured) {
    // attacker already occupies the square; just make sure the dead target object is detached
    if (target.hp <= 0 && b[target.r] && b[target.r][target.c] === target) b[target.r][target.c] = null;
    logMsg(`💀 <b>${shortName(target)}</b> is destroyed — capture complete!`, 'bad');
  } else if (res.winner === 'def' && res.atkDead) {
    // attacker died ON the target square while target survived elsewhere?? 
    // target still stands on that square conceptually: remove attacker, restore target there.
    b[attacker.r][attacker.c] = target;
    target.r = attacker.r; target.c = attacker.c;
    logMsg(`🛡 <b>${shortName(attacker)}</b> fell fighting — the attack is repelled!`, 'good');
  } else if (res.winner === 'def') {
    // attacker survived but lost the exchange → attacker retreats to its origin square
    const or = mv.originR, oc = mv.originC;
    if (b[or][oc] === attacker || b[or][oc] === null) {
      b[attacker.r][attacker.c] = null;
      attacker.r = or; attacker.c = oc; b[or][oc] = attacker;
    }
    logMsg(`↩ ${shortName(attacker)} loses the duel and retreats. ${shortName(target)} holds.`, 'sys');
  } else if (res.winner === 'none') {
    // disengage/stalemate → attacker returns to origin square, no capture
    const or = mv.originR, oc = mv.originC;
    b[attacker.r][attacker.c] = null;
    attacker.r = or; attacker.c = oc; b[or][oc] = attacker;
    logMsg(`🏳 ${res.note || 'Engagement broken off'} — no capture.`, 'sys');
  } else if (res.winner === 'atk' && res.defRouted) {
    // attacker wins on tempo: target is routed BACK to its origin square, attacker holds the capture square
    const or = mv.originR, oc = mv.originC;
    b[attacker.r][attacker.c] = null;
    target.r = or; target.c = oc; b[or][oc] = target;
    attacker.r = mv.r; attacker.c = mv.c; b[mv.r][mv.c] = attacker;
    logMsg(`✅ ${shortName(attacker)} drives off ${shortName(target)} — pushed back, wounded!`, 'good');
  } else if (res.winner === 'atk') {
    logMsg(`✅ ${shortName(attacker)} wins the exchange but cannot finish ${shortName(target)} — it flees back.` , 'sys');
    const or = mv.originR, oc = mv.originC;
    b[attacker.r][attacker.c] = null;
    attacker.r = or; attacker.c = oc; b[or][oc] = attacker;
  }
}

function checkMatchEndConditions() {
  if (!findKing(state.board, 'w')) return endMatch('b', 'White King eliminated');
  if (!findKing(state.board, 'b')) return endMatch('w', 'Black King eliminated');
  const mover = state.turn;
  if (!allLegalMoves(state.board, mover).length) {
    if (isInCheck(state.board, mover)) endMatch(mover === 'w' ? 'b' : 'w', 'Checkmate');
    else endMatch(null, 'Stalemate');
  }
}

function endMatch(winnerColor, reason) {
  state.gameOver = true;
  const title = winnerColor ? (winnerColor === 'w' ? '🏆 Samurai Victory!' : '🌑 Shinobi Victory!') : '🤝 Draw';
  showModal(title, `${reason}<br><br><button class="big-btn" onclick="location.reload()">Back to Menu</button>`);
  logMsg(`<b>${title}</b> — ${reason}`, 'good');
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

/* ============================================================
   COMBAT UI — interactive encounters
   ============================================================ */
let activeCombat = null;

async function runCombatUI(ctx) {
  return new Promise((resolve) => {
    const combat = new Combat(ctx, {});
    activeCombat = combat;
    $('combat').classList.remove('hidden');
    setupCombatVisuals(combat);

    // Support phase (auto-resolved with flair)
    const lines = combat.runSupportPhase();
    refreshPartyCards(combat);
    showCombatLines(lines, async () => {
      await combatLoopStep(combat, ctx, resolve);
    });
  });
}

function setupCombatVisuals(combat) {
  const A = combat.attacker, D = combat.target;
  $('spriteAtk').textContent = GLYPH[A.type];
  $('spriteDef').textContent = GLYPH[D.type];
  $('atkTitle').textContent = `ATTACKER — ${combat.atkSet.name}`;
  $('defTitle').textContent = `DEFENDER — ${combat.defSet.name}`;
  buildPartyDom('atkParty', combat.ctx.atkSide, A, combat);
  buildPartyDom('defParty', combat.ctx.defSide, D, combat);
  setMsg(`⚔ ENGAGEMENT at ${sqName(A.r, A.c)}`);
}

function buildPartyDom(elId, side, primary, combat) {
  const el = $(elId); el.innerHTML = '';
  side.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pcard'; card.dataset.pid = p.id;
    const role = p.id === primary.id ? (elId === 'atkParty' ? 'PRIMARY' : 'DEFENDER') : 'SUPPORT';
    card.innerHTML = `<div class="pname" style="color:${p.color==='w'?'#fff':'#0f1830'};text-shadow:0 0 6px ${p.color==='w'?'#e8c15a':'#5aa7e8'}">${GLYPH[p.type]}</div>` +
      `<div>${PIECE_NAME[p.type]} <small>${sqName(p.r,p.c)}</small></div>` +
      `<div class="prole">${role}</div>` +
      `<div class="php"><i></i></div>`;
    el.appendChild(card);
  });
  refreshPartyCards(combat);
}

function refreshPartyCards(combat) {
  for (const elId of ['atkParty', 'defParty']) {
    const el = $(elId);
    [...el.children].forEach(card => {
      const pid = +card.dataset.pid;
      const p = combat.ctx.atkSide.concat(combat.ctx.defSide).find(x => x.id === pid);
      if (!p) return;
      let cur = p.hp;
      if (p.id === combat.attacker.id) cur = combat.hpA;
      if (p.id === combat.target.id) cur = combat.hpD;
      const fill = card.querySelector('.php i');
      const ratio = Math.max(0, cur / p.maxHp);
      fill.style.width = (ratio * 100) + '%';
      fill.style.background = ratio < 0.34 ? '#e0596a' : ratio < 0.7 ? '#e8c15a' : '#58d08a';
      if (cur <= 0) card.classList.add('dead'); else card.classList.remove('dead');
    });
  }
}

function setMsg(html) { $('combatMsg').innerHTML = html; }

function showCombatLines(lines, done) {
  if (!lines.length) return done();
  let i = 0;
  const step = () => {
    if (i >= lines.length) return done();
    setMsg(lines[i++]);
    setTimeout(step, 750);
  };
  step();
}

function spawnDamageFx(side, dmg, cls) {
  const fx = $('fxLayer');
  const n = document.createElement('div');
  n.className = 'dmg-num ' + (cls || 'norm');
  n.textContent = dmg > 0 ? '-' + dmg : 'MISS';
  n.style.left = side === 'd' ? '18%' : '72%';
  n.style.top = '60px';
  fx.appendChild(n);
  const spr = side === 'd' ? $('spriteDef') : $('spriteAtk');
  spr.classList.add('shake');
  setTimeout(() => { n.remove(); spr.classList.remove('shake'); }, 900);
  // slash fx
  const s = document.createElement('div');
  s.className = 'slash-fx'; s.textContent = '✦';
  s.style.left = side === 'd' ? '22%' : '68%'; s.style.top = '40px'; s.style.color = '#ffd75e';
  fx.appendChild(s); setTimeout(() => s.remove(), 450);
}

/* ---- The combat driver loop ---- */
async function combatLoopStep(combat, ctx, resolve) {
  while (true) {
    const ended = combat.checkEnd();
    if (ended) return conclude(ended);
    refreshPartyCards(combat);

    const attackerIsHuman = ctx.attackerIsHuman;
    const defenderIsHuman = ctx.defenderIsHuman;

    // --- Attacker chooses ---
    let atkMove = null;
    if (attackerIsHuman) {
      atkMove = await humanAttackChoice(combat);
      if (atkMove === 'retreat') return conclude(combat.disengage('atk'));
    } else {
      setMsg('<span class="ai-thinking">CPU attacker is scheming…</span>');
      await sleep(700);
      atkMove = aiAttackMove(combat, AI_LEVELS[state.diff]);
      if (atkMove === 'retreat') return conclude(combat.disengage('atk'));
    }

    // Finisher shortcut
    if (atkMove === 'finisher') {
      const f = combat.useFinisher();
      lunge('atk'); spawnDamageFx('d', f.dmgT, 'crit'); setMsg(f.txt);
      await sleep(850);
      const e = combat.checkEnd(); if (e) return conclude(e);
      continue;
    }

    // --- Defender responds ---
    let resp = null;
    if (defenderIsHuman) {
      resp = await humanDefenseTiming(combat, atkMove);   // may return null = no response
    } else {
      setMsg(`<span class="ai-thinking">Incoming ${atkMove.toUpperCase()} — CPU defender reacts…</span>`);
      await sleep(500);
      const ai = aiDefend(combat, AI_LEVELS[state.diff]);
      resp = { resp: ai.resp, quality: ai.quality };
    }

    const ex = combat.resolveExchange(atkMove, resp ? resp.resp : null, resp ? resp.quality : null);
    await playExchangeFx(ex, atkMove);

    const e2 = combat.checkEnd();
    if (e2) return conclude(e2);
  }

  function conclude(result) {
    const banner = {
      atk: result.captured ? '💀 TARGET DESTROYED — capture succeeds!' : '✅ ATTACKER WINS the exchange!',
      def: result.atkDead ? '☠ ATTACKER SLAIN defending the square!' : '🛡 DEFENDER HOLDS!',
      none: '🏳 Engagement broken off…',
    }[result.winner] || '…';
    setMsg(banner);
    setTimeout(() => {
      $('combat').classList.add('hidden');
      resolve(result);
    }, 1100);
  }
}

function lunge(who) {
  const el = who === 'atk' ? $('spriteAtk') : $('spriteDef');
  el.classList.add(who === 'atk' ? 'lungeR' : 'lungeL');
  setTimeout(() => el.classList.remove('lungeR', 'lungeL'), 250);
}

async function playExchangeFx(ex, atkMove) {
  lunge('atk');
  for (const ev of ex.events) {
    if (ev.dmgT) spawnDamageFx(ev.side, ev.dmgT, ev.cls === 'crit' ? 'crit' : 'norm');
    else setMsg(`<span class="${ev.cls === 'crit' ? 'perfect' : ev.cls === 'dodged' ? 'dodged' : ev.cls === 'blocked' ? 'blocked' : ''}">${ev.txt}</span>`);
    await sleep(520);
  }
  if (ex.defDmg) { lunge('def'); await sleep(150); }
  await sleep(350);
}

/* ---- Human attacker menu ---- */
function humanAttackChoice(combat) {
  return new Promise((resolve) => {
    const menu = $('actionMenu');
    menu.classList.remove('hidden');
    $('timingWrap').classList.add('hidden');
    $('atkMomentum').textContent = combat.momentum.a;
    const ab = combat.atkSet.abilities.primary[0];
    const abRow = $('abilityActions');
    abRow.innerHTML = '';
    const mkAb = () => {
      const btn = document.createElement('button');
      btn.className = 'act ability';
      btn.innerHTML = `${ab.label}<br><span>${ab.cost} Momentum — ${ab.desc}</span>`;
      btn.disabled = combat.momentum.a < ab.cost;
      btn.onclick = () => close(ab.key);
      abRow.appendChild(btn);
    };
    mkAb();
    const fin = document.createElement('button');
    fin.className = 'act ability';
    fin.innerHTML = `💥 FINISHER<br><span>3 Momentum — massive blow</span>`;
    fin.disabled = combat.momentum.a < 3;
    fin.onclick = () => close('finisher');
    abRow.appendChild(fin);

    setMsg(`Your move — read your opponent. Momentum: ${combat.momentum.a}/3`);
    const handlers = {};
    const close = (val) => {
      menu.classList.add('hidden');
      document.querySelectorAll('#mainActions .act').forEach(b => b.onclick = null);
      resolve(val);
    };
    document.querySelectorAll('#mainActions .act').forEach(b => {
      b.onclick = () => close(b.dataset.a);
    });
    $('disengageBtn').onclick = () => close('retreat');
  });
}

/* ---- Human defense timing minigame (skill-based) ----
   Marker sweeps the bar. Tap = DODGE attempt; hold-B/right-click = BLOCK attempt.
   Position within zones determines quality:
     inside perfect zone  → 'perfect'
     inside dodge/block window → 'good'
     outside              → 'late' (still counts as that response but sloppy)
   Doing nothing until sweep ends twice-ish → no response (free hit for attacker). */
function humanDefenseTiming(combat, atkMove) {
  return new Promise((resolve) => {
    const wrap = $('timingWrap');
    wrap.classList.remove('hidden');
    $('actionMenu').classList.add('hidden');
    setMsg(`INCOMING: <span class="perfect">${atkMove.toUpperCase()}</span> — time your defense!`);

    const bar = $('timingBar');
    const marker = $('marker');
    const perfectZone = $('perfectZone');

    // randomized defense window each exchange — reading & reaction matter, RNG only positions it
    const set = combat.defSet;
    const pw = set.perfectWindow;
    const dw = set.dodgeWindow;
    const center = 0.35 + Math.random() * 0.45;         // perfect spot
    const dodgeLo = Math.max(0, center - dw / 2), dodgeHi = Math.min(1, center + dw / 2);
    perfectZone.style.left = (center - pw / 2) * 100 + '%';
    perfectZone.style.width = pw * 100 + '%';
    bar.querySelector('.block-zone').style.left = dodgeLo * 100 + '%';
    bar.querySelector('.block-zone').style.width = (dodgeHi - dodgeLo) * 100 + '%';

    let pos = 0, dir = 1;
    const speed = (0.75 + Math.random() * 0.4);         // units/sec
    let raf, last = performance.now(), answered = false;
    const passesAllowed = 2; let passes = 0;

    const finish = (resp, quality) => {
      if (answered) return; answered = true;
      cancelAnimationFrame(raf);
      wrap.classList.add('hidden');
      document.removeEventListener('keydown', onKey);
      bar.removeEventListener('pointerdown', onPointer);
      bar.removeEventListener('contextmenu', onCtx);
      resolve(resp ? { resp, quality } : null);
    };
    const evalPos = () => {
      const inPerfect = Math.abs(pos - center) <= pw / 2;
      const inWin = pos >= dodgeLo && pos <= dodgeHi;
      if (inPerfect) return 'perfect';
      if (inWin) return 'good';
      return 'late';
    };
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); finish('dodge', evalPos()); }
      if (e.code === 'KeyB') { finish('block', evalPos()); }
      if (e.code === 'KeyC') { finish('counter', evalPos()); }
    };
    const onPointer = (e) => {
      if (e.button === 2) return;
      finish('dodge', evalPos());
    };
    const onCtx = (e) => { e.preventDefault(); finish('block', evalPos()); };
    document.addEventListener('keydown', onKey);
    bar.addEventListener('pointerdown', onPointer);
    bar.addEventListener('contextmenu', onCtx);

    const tick = (now) => {
      const dt = (now - last) / 1000; last = now;
      pos += dir * speed * dt;
      if (pos >= 1) { pos = 1; dir = -1; passes++; }
      if (pos <= 0) { pos = 0; dir = 1; passes++; }
      marker.style.left = (pos * 100) + '%';
      if (passes >= passesAllowed * 2) return finish(null, null); // never responded → free hit
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
}

/* ================= INIT ================= */
function renderAll() { renderBoard(); }
