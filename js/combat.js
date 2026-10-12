/* ============================================================
   combat.js — turn-based RPG engagement engine (skill > RNG)

   Design follows the README rules:
   - Rock-paper-scissors attack/defense mindgame (Quick/Heavy/Feint vs
     Dodge/Block/Counter) with a Clair-Obscur-style timing window.
   - Supports do NOT deal raw damage every turn — they use one support
     action each (buff/debuff/shield), so 3v1 is strong but not auto-win.
   - Momentum resource: hits generate it, dodges generate Resolve which
     funds debuffs/counters.
   - Battles are short: ~4-8 exchanges max, then forced resolution.
   ============================================================ */

const SETS = {
  samurai: {
    name: 'Samurai',
    passiveDesc: 'Bushido: +15% damage dealt.',
    atkMult: 1.15,
    perfectWindow: 0.16,        // wider parry/perfect window (Precision Stance)
    dodgeWindow: 0.22,
    abilities: {
      primary: [
        { key: 'iaijutsu', label: '🗡 Iaijutsu', cost: 2, desc: 'Heavy strike: ignores Block, punishes Dodge. High dmg.' },
      ],
      supportByType: {
        r: { key: 'bulwark', label: '🛡 Bulwark', desc: 'Guardian: defender side takes -30% dmg next exchange.' },
        b: { key: 'hex', label: '🔮 Onmyoji Hex', desc: 'Curses target: Exposed (+15% dmg taken, 2 ex).' },
        q: { key: 'flurry', label: '⚔ Bladestorm', desc: 'Shogun strikes for bonus dmg.' },
        n: { key: 'pursuit', label: '🐎 Pursuit', desc: 'Rider: attacker gains +1 Momentum.' },
        p: { key: 'rally', label: '🚩 Rally', desc: 'Ashigaru: attacker +20% dmg this battle.' },
        k: { key: 'oath', label: '👑 Blood Oath', desc: 'Daimyo: attacker heals 12 HP.' },
      },
    },
  },
  shinobi: {
    name: 'Shinobi',
    passiveDesc: 'Shadow: successful dodges grant +1 Momentum and apply Poison.',
    atkMult: 1.0,
    perfectWindow: 0.11,
    dodgeWindow: 0.30,          // bigger dodge window (evasion identity)
    substitution: 0.20,         // 20% auto-dodge when hit would be lethal
    abilities: {
      primary: [
        { key: 'kunai', label: '🌀 Poison Kunai', cost: 1, desc: 'Light strike; stacks Venom (chip dmg).' },
      ],
      supportByType: {
        r: { key: 'koturi', label: '🛡 Iron Gate', desc: 'Defender-side shield: -30% dmg next exchange.' },
        b: { key: 'smoke', label: '💨 Smoke Screen', desc: 'Attacker suffers -25% dmg next exchange.' },
        q: { key: 'assassinate', label: '🗡 Assassinate', desc: 'Kunoichi master strikes for bonus dmg.' },
        n: { key: 'poisonblade', label: '☠ Poison Blade', desc: 'Applies Venom to the enemy primary.' },
        p: { key: 'mislead', label: '🎭 Misdirection', desc: 'Next enemy attack has wide miss chance.' },
        k: { key: 'clan', label: '👑 Clan Rite', desc: 'Clan leader heals defender primary 12 HP.' },
      },
    },
  },
};

/* ---- Exchange resolution matrix (the mindgame). Rows = attack, cols = defense.
   dmg: multiplier on base damage. outcome drives momentum/statuses. ---- */
const MATRIX = {
  quick:  { dodge: 'dodgeWin',   block: 'graze',    counter: 'counterLoss' },
  heavy:  { dodge: 'dodgeBig',   block: 'break',    counter: 'heavyHit'    },
  feint:  { dodge: 'punish',     block: 'weakHit',  counter: 'counterLoss' },
  iaijutsu:{dodge: 'noDodge',    block: 'break',    counter: 'heavyHit'    },
  kunai:  { dodge: 'dodgeWin',   block: 'graze',    counter: 'counterLoss' },
  flurry: { dodge: 'noDodge',    block: 'break',    counter: 'heavyHit'    },
  assassinate:{dodge:'noDodge',  block: 'break',    counter: 'heavyHit'    },
};

class Combat {
  /* ctx: { board, attacker, target, atkSide[], defSide[] } */
  constructor(ctx, cb) {
    this.ctx = ctx;
    this.cb = cb;                 // {onEnd(result), log(msg, cls)}
    this.attacker = ctx.attacker;
    this.target = ctx.target;
    this.atkSet = ctx.atkSet;     // set object
    this.defSet = ctx.defSet;
    this.momentum = { a: 0, d: 0 };
    this.exchange = 0;
    this.maxExchanges = 7;        // battles stay SHORT
    this.mods = {                 // per-exchange modifiers from supports
      atkDmgMult: 1, defShieldMult: 1, atkBattleMult: 1,
      smokeNext: false, misdirectNext: false,
    };
    this.usedSupports = new Set();
    this.over = false;
    // battle-local HP mirrors persist back to pieces at end
    this.hpA = this.attacker.hp;
    this.hpD = this.target.hp;
  }

  baseDamage(who, mult) {
    const p = who === 'a' ? this.attacker : this.target;
    const set = who === 'a' ? this.atkSet : this.defSet;
    let dmg = effAtk(p) * hpFactor(p) * (set.atkMult || 1);
    if (hasStatus(p, 'poison')) dmg *= 0.9;
    return dmg * mult;
  }

  /* Support pieces act once at battle start — restricted actions, no raw spam */
  runSupportPhase() {
    const lines = [];
    for (const p of this.ctx.atkSide) {
      if (p.id === this.attacker.id) continue;
      lines.push(this.applySupport(p, 'a'));
    }
    for (const p of this.ctx.defSide) {
      if (p.id === this.target.id) continue;
      lines.push(this.applySupport(p, 'd'));
    }
    return lines.filter(Boolean);
  }

  applySupport(p, side) {
    const set = side === 'a' ? this.atkSet : this.defSet;
    const ab = set.abilities.supportByType[p.type];
    if (!ab) return null;
    if (this.usedSupports.has(p.id)) return null;
    this.usedSupports.add(p.id);
    const foe = side === 'a' ? 'd' : 'a';
    switch (ab.key) {
      case 'bulwark': case 'koturi':
        if (side === 'a') this.mods.atkBattleMult *= 1.12;     // guardian empowers the push
        else this.mods.defShieldMult *= 0.8;                   // shield softens every incoming blow
        return `${shortName(p)} uses ${ab.label}`;
      case 'hex':
        if (side === 'a') addStatus(this.target, 'exposed', 3);
        else addStatus(this.attacker, 'exposed', 3);
        return `${shortName(p)} hexes ${shortName(side==='a'?this.target:this.attacker)} → Exposed`;
      case 'flurry': case 'assassinate':
        // battle-shout opening: boosts own primary's damage for the whole duel
        if (side === 'a') this.mods.atkBattleMult *= 1.25; else this.mods.ripBattMult = (this.mods.ripBattMult||1) * 1.25;
        return `${shortName(p)} unleashes ${ab.label}`;
      case 'pursuit': this.momentum[side] += 1; return `${shortName(p)} gallops in → +1 Momentum`;
      case 'rally': this.mods.atkBattleMult *= 1.2; return `${shortName(p)} raises ${ab.label}`;
      case 'poisonblade': addStatus(side==='a'?this.target:this.attacker, 'poison', 4);
        return `${shortName(p)} coats blades → Venom`;
      case 'smoke': this.mods.smokeNext = side === 'd'; return `${shortName(p)} throws ${ab.label}`;
      case 'mislead': this.mods.misdirectNext = side === 'd'; return `${shortName(p)} performs ${ab.label}`;
      case 'oath': case 'clan': {
        const t = side === 'a' ? this.attacker : this.target;
        const amt = 12; 
        if (side === 'a') this.hpA = Math.min(t.maxHp, this.hpA + amt);
        else this.hpD = Math.min(t.maxHp, this.hpD + amt);
        return `${shortName(p)} channels ${ab.label} (+${amt} HP)`;
      }
    }
    return null;
  }

  /* One full exchange: attacker picks move, defender responds (timing or AI).
     defResp: 'dodge' | 'block' | 'counter' | 'none' (no response)
     defQuality: 'perfect'|'good'|'late'|null */
  resolveExchange(atkMove, defResp, defQuality) {
    if (!defResp) defResp = defQuality ? defQuality : 'none';
    if (defResp === 'none') return this.resolveUnopposed(atkMove);
    this.exchange++;
    const ev = [];
    const m = MATRIX[atkMove][defResp];
    let atkDmg = 0, defDmg = 0;
    const baseMult = { quick: 0.7, heavy: 1.4, feint: 0.5, iaijutsu: 1.6, kunai: 0.6, flurry: 1.3, assassinate: 1.35 }[atkMove] || 1;

    const poisonTick = (p) => { if (hasStatus(p, 'poison')) { const d = 4; if (p === this.attacker) this.hpA -= d; else this.hpD -= d; ev.push({ txt: `Venom stings ${shortName(p)} (-${d})`, cls: 'bad' }); } };

    switch (m) {
      case 'dodgeWin':
        ev.push({ txt: defQuality === 'perfect' ? 'PERFECT DODGE!' : 'Dodged!', cls: 'dodged' });
        this.momentum.d += defQuality === 'perfect' ? 2 : 1;
        if (this.defSet.name === 'Shinobi') {
          this.momentum.d += 1;
          addStatus(this.attacker, 'poison', 3);
          ev.push({ txt: 'Shadow passive: attacker is poisoned', cls: 'bad' });
        }
        if (defQuality === 'perfect') addStatus(this.attacker, 'exposed', 2);
        break;
      case 'dodgeBig':
        ev.push({ txt: defQuality === 'perfect' ? 'PERFECT DODGE — Heavy whiffs!' : 'Dodged the heavy!', cls: 'dodged' });
        this.momentum.d += 2;
        addStatus(this.attacker, 'exposed', 2);
        if (this.defSet.name === 'Shinobi') addStatus(this.attacker, 'poison', 3);
        break;
      case 'noDodge':
        // Iaijutsu/Flurry cannot be dodged — only blocked badly or countered risky
        atkDmg = this.computeDmg(baseMult);
        ev.push({ txt: 'Unavoidable strike!', cls: '' });
        break;
      case 'graze':
        atkDmg = this.computeDmg(baseMult * (defQuality === 'perfect' ? 0.25 : 0.45));
        ev.push({ txt: defQuality === 'perfect' ? 'PERFECT BLOCK — graze only!' : 'Blocked (graze)', cls: 'blocked' });
        this.momentum.a += 1;
        break;
      case 'break':
        atkDmg = this.computeDmg(baseMult * 1.15);
        ev.push({ txt: 'BLOCK BROKEN!', cls: 'crit' });
        this.momentum.a += 2;
        addStatus(this.target, 'stagger', 1);
        break;
      case 'heavyHit':
        atkDmg = this.computeDmg(baseMult);
        this.momentum.a += 2;
        ev.push({ txt: defResp === 'counter' ? 'Counter whiffs — crushed!' : 'Solid hit!', cls: '' });
        break;
      case 'weakHit':
        atkDmg = this.computeDmg(baseMult * 0.6);
        this.momentum.a += 1;
        ev.push({ txt: 'Weak hit through guard', cls: '' });
        break;
      case 'punish':
        atkDmg = this.computeDmg(baseMult * 1.5);
        this.momentum.a += 2;
        ev.push({ txt: 'FEINT PUNISHES THE DODGE!', cls: 'crit' });
        addStatus(this.target, 'exposed', 2);
        break;
      case 'counterLoss': {
        // counter lands first (quick/feint are slow to commit)
        defDmg = this.computeDefDmg(defQuality === 'perfect' ? 1.2 : 0.7);
        this.momentum.d += defQuality === 'perfect' ? 2 : 1;
        if (defQuality === 'perfect') { addStatus(this.attacker, 'wound', 3); ev.push({ txt: 'PERFECT COUNTER! Attacker WOUNDED', cls: 'crit' }); }
        else ev.push({ txt: 'Counterattack!', cls: '' });
        atkDmg = this.computeDmg(baseMult * 0.5); // attacker still partially connects
        break;
      }
    }

    // Support-phase modifiers apply to the primary's incoming damage too
    if (atkDmg > 0) atkDmg = Math.max(1, Math.round(atkDmg * this.mods.defShieldMult));
    if (defDmg > 0) defDmg = Math.max(1, Math.round(defDmg * this.mods.atkDmgMult));

    // Substitution (shinobi): auto-dodge lethal blow as last resort
    if (atkDmg >= this.hpD && this.defSet.substitution && Math.random() < this.defSet.substitution) {
      atkDmg = 0;
      ev.push({ txt: '🌀 SUBSTITUTION! A log takes the blow…', cls: 'dodged' });
      this.momentum.d += 1;
    }

    if (atkDmg > 0) { this.hpD -= atkDmg; ev.push({ txt: `${shortName(this.target)} -${atkDmg}`, cls: 'norm', dmgT: atkDmg, side: 'd' }); this.momentum.a += 1; }
    if (defDmg > 0) { this.hpA -= defDmg; ev.push({ txt: `${shortName(this.attacker)} -${defDmg}`, cls: 'norm', dmgT: defDmg, side: 'a' }); }

    poisonTick(this.attacker); poisonTick(this.target);

    // Staggered initiative: the defending primary always gets a riposte slice.
    // This keeps duels dynamic and prevents the attacker from snowballing for free.
    if (!['punish', 'break'].includes(m) && this.hpA > 0 && this.hpD > 0 && this.exchange < this.maxExchanges) {
      const extraD = this.ctx.defSide.length - 1;
      const rd = Math.round(this.computeDefDmg(0.45 + 0.18 * extraD) * (this.mods.ripBattMult || 1));   // supported defenders press harder
      this.hpA -= rd;
      ev.push({ txt: `${shortName(this.target)} ripostes (-${rd})`, cls: 'norm', dmgT: rd, side: 'a' });
    }

    // spend attacker momentum automatically on finisher threshold
    // (players get manual choice via UI; AI uses it directly)
    return { events: ev, atkDmg, defDmg };
  }

  resolveUnopposed(atkMove) {
    this.exchange++;
    const ev = [];
    const baseMult = { quick: 0.7, heavy: 1.4, feint: 0.5, iaijutsu: 1.6, kunai: 0.6, flurry: 1.3, assassinate: 1.35 }[atkMove] || 1;
    const dmg = this.computeDmg(baseMult * 1.1);   // free hit bonus
    this.hpD -= dmg;
    this.momentum.a += 2;
    ev.push({ txt: 'NO RESPONSE — clean hit!', cls: 'crit' });
    ev.push({ txt: `${shortName(this.target)} -${dmg}`, cls: 'norm', dmgT: dmg, side: 'd' });
    if (hasStatus(this.attacker, 'poison')) { this.hpA -= 4; ev.push({ txt: `Venom stings ${shortName(this.attacker)} (-4)`, cls: 'bad' }); }
    if (hasStatus(this.target, 'poison')) { this.hpD -= 4; ev.push({ txt: `Venom stings ${shortName(this.target)} (-4)`, cls: 'bad' }); }
    return { events: ev, atkDmg: dmg, defDmg: 0 };
  }

  computeDmg(mult) {
    const defReduce = 1 / (1 + effDef(this.target) / 30);
    let d = this.baseDamage('a', mult) * defReduce * this.mods.atkDmgMult * this.mods.defShieldMult * this.mods.atkBattleMult;
    if (hasStatus(this.target, 'exposed')) d *= 1.15;
    if (this.mods.smokeNext) { d *= 0.75; this.mods.smokeNext = false; }
    if (this.mods.misdirectNext && Math.random() < 0.35) { this.mods.misdirectNext = false; return 0; }
    return Math.max(1, Math.round(d));
  }
  computeDefDmg(mult) {
    const defReduce = 1 / (1 + effDef(this.attacker) / 30);
    let d = this.baseDamage('d', mult * 0.8) * defReduce;
    if (hasStatus(this.attacker, 'exposed')) d *= 1.15;
    return Math.max(1, Math.round(d));
  }

  /* Finisher: 3 momentum → powerful blow (manual or auto) */
  useFinisher() {
    if (this.momentum.a < 3) return null;
    this.momentum.a -= 3;
    const dmg = Math.round(this.baseDamage('a', 1.8));
    this.hpD -= dmg;
    return { txt: `💥 FINISHER! -${dmg}`, dmgT: dmg, side: 'd', cls: 'crit' };
  }

  checkEnd() {
    if (this.over) return this.overResult;
    if (this.hpD <= 0) return this.finish('atkWin');
    if (this.hpA <= 0) return this.finish('defWin');
    if (this.exchange >= this.maxExchanges) {
      // attrition stalemate: higher HP-ratio wins narrowly; else both disengage
      const ra = this.hpA / this.attacker.maxHp, rd = this.hpD / this.target.maxHp;
      if (Math.abs(ra - rd) < 0.12) return this.finish('draw');
      return this.finish(ra > rd ? 'atkWin' : 'defWin');
    }
    return null;
  }

  /* Persist consequences back onto the chess pieces (RPG → chess feedback) */
  finish(reason) {
    this.over = true;
    const A = this.attacker, D = this.target;
    A.hp = Math.max(0, Math.round(this.hpA));
    D.hp = Math.max(0, Math.round(this.hpD));

    let result;
    if (reason === 'atkWin') {
      if (D.hp <= 0) {
        if (D.type === 'k') {
          // King is never removed by combat — it survives at 1 HP, badly wounded.
          D.hp = 1; addStatus(D, 'wound', 6);
          result = { winner: 'atk', captured: false, kingDown: true };
        } else {
          result = { winner: 'atk', captured: true };   // caller removes piece & completes capture
        }
        A.xp += 2;                          // veteran progression
        tickXp(A);
      } else {
        // attrition win: target survives but attacker holds tempo → target routed back, wounded
        result = { winner: 'atk', captured: false, defRouted: true };
        addStatus(D, 'wound', 4);
        A.xp += 1; tickXp(A);
      }
      if (A.hp > 0) addStatus(A, 'adrenaline', 2); // buff feeds next fight
    } else if (reason === 'defWin') {
      result = { winner: 'def' };
      addStatus(A, 'wound', 4); addStatus(A, 'fatigue', 3);
      if (A.hp <= 0) {
        if (A.type === 'k') { A.hp = 1; addStatus(A, 'wound', 6); result.kingDown = true; }
        else result.atkDead = true;         // caller removes attacker from its square
      }
      D.xp += 1; tickXp(D);
    } else if (reason === 'retreatAtk') {
      result = { winner: 'none', note: 'attacker retreated' };
      addStatus(A, 'fatigue', 3);
    } else if (reason === 'escapeDef') {
      result = { winner: 'none', note: 'defender escaped' };
      addStatus(D, 'fatigue', 3);
    } else { // draw
      result = { winner: 'none', note: 'stalemate — both withdraw' };
      addStatus(A, 'fatigue', 2); addStatus(D, 'fatigue', 2);
    }
    // statuses decay on board too
    tickStatuses(A); tickStatuses(D);
    this.overResult = result;
    return result;
  }

  disengage(by) {
    return this.finish(by === 'atk' ? 'retreatAtk' : 'escapeDef');
  }
}

function shortName(p) {
  const set = p.color === 'w' ? 'Samurai' : 'Shinobi';
  return `${p.color === 'w' ? '♙' : '♟'}${PIECE_NAME[p.type]}@${sqName(p.r, p.c)}`;
}
function removePiece(board, p) { if (board[p.r][p.c] === p) board[p.r][p.c] = null; }
function tickXp(p) {
  if (p.xp >= 3 && !p._vetAnnounced) { p._vetAnnounced = true; }
}
