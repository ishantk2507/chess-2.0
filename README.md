# RANDOM GAME IDEA

- Chess normally but make it turn based rogue like : say a pawn is gonna attack another pawn its not a straight up one kill instead its gonna be a turn based rpg like combat if other peices can also reach that pawn directly they also join the party to fight and in pvp we can dodge the attacks accordingly . well for each succesfull attack on that turn the attacking player gets a buff while the opponents gets to apply debuffs on the attacking player pawn for each succesful dodge

---

### GPT REPONZES:

Oh, I absolutely see the game you’re imagining. 😄 And there’s a genuinely interesting core here: you’re not just putting RPG combat on top of chess—you’re making the chess position determine who participates in each micro-battle.

The closest way I’d describe it is:

> Chess × turn-based RPG combat × roguelike progression × tactical PvP.
> 

Your core loop, as I understand it

Imagine White pawn attacks Black pawn.

Instead of:

Pawn → captures pawn → pawn disappears

you get:

Pawn initiates attack → combat encounter begins.

The chessboard determines the combatants:

The attacking pawn is the main fighter.

Any other White pieces that have a direct attack/line toward the target can potentially join the battle as allies.

Black pieces that defend/support the target can potentially join as reinforcements.

The actual fight happens through RPG-style turns.

Both players can make tactical decisions during combat rather than the chess capture being automatic.

And your particularly interesting mechanic is:

Successful attack → attacker gains a buff.

Successful dodge → defender gets to apply a debuff to the attacking pawn.

That creates a weird little risk/reward economy around every capture attempt.

---

The part I think is genuinely strong

The board position becomes your party-building system.

You don't select:

> Warrior + Mage + Healer
> 

You create that party by arranging your chess pieces.

For example:

♜
│
│
♝ ───── ♟ ← attacking pawn
│
♞

If several pieces have influence over the battle, the encounter might become:

White

Pawn — frontline

Bishop — ranged/support

Rook — heavy attacker

vs.

Black

Pawn — frontline

Knight — assassin

Queen — powerful support

So suddenly putting your bishop behind your pawn isn't merely "protecting the pawn."

You're potentially positioning your bishop as a combat participant.

That's a very cool design space.

---

And here's where the roguelike part could become REALLY interesting

I'd consider giving each piece a persistent build during a match/run.

Not necessarily permanent progression across games—that could create PvP balance problems—but progression within a run.

For example:

Pawn

Starts:

Pawn

HP: 100

Attack: 10

Defense: 8

Dodge: 10%

After winning several encounters:

> Promotion Path discovered
> 

You could choose:

Berserker Pawn

+Attack

Gets stronger when below 30% HP

Guardian Pawn

+Defense

Can intercept attacks aimed at allied pieces

Duelist Pawn

+Dodge

Counterattacks successful dodges

Corrupted Pawn

Applies stacking debuffs

Lower maximum HP

Now your chess pawn isn't just "a pawn."

It's your pawn's RPG build for this run.

---

Your dodge mechanic has an especially interesting consequence

Suppose I attack your pawn.

Instead of you simply selecting:

> Attack
> 

you get something like:

BLACK PAWN
HP 72/100

Incoming:
⚔ White Pawn — Heavy Strike

Choose:

[ DODGE ]   [ BLOCK ]   [ COUNTER ]

You dodge.

Successful dodge

White doesn't deal damage.

But Black gets:

> Momentum
> 

and can inflict:

> Exposed White Pawn takes +15% damage for 2 turns.
> 

So attacking isn't automatically good.

The attacker has to think:

> "This pawn is weak, but if I engage it, my pawn could accumulate nasty debuffs."
> 

That creates a second tactical layer on top of chess.

---

But there's one thing I'd be VERY careful about

You don't want the game to become:

Chess position → random RPG fight → whoever has better stats wins.

That would undermine the chess component.

The combat should ideally be a consequence of the chess position, rather than something that replaces chess.

I'd therefore make the chess position determine things like:

Who can participate

Board geometry.

Starting advantage

Position/initiative.

Available abilities

Piece type.

Reinforcements

Other pieces attacking/defending the target.

Escape options

Legal chess movement.

Long-term consequences

Injuries, buffs, debuffs, promotions, etc.

So the player who understands chess should naturally be creating better combat situations.

---

There's also a potentially insane mechanic hiding in your idea

Sacrifices.

Normal chess:

> "I'll sacrifice my bishop to win your queen."
> 

Your game:

> "I'll sacrifice my bishop because killing your pawn triggers my knight's Berserker passive and gives my rook a permanent run buff."
> 

Suddenly a chess sacrifice can have an entirely different strategic meaning.

And conversely:

> "I could capture that bishop, but doing so puts my queen inside a 3-piece enemy attack zone."
> 

Now the capture itself becomes a risk assessment.

That's where I think your concept could develop its own identity.

---

Is it original?

The individual ingredients aren't completely unprecedented.

There are games that combine chess with RPG mechanics, chess-like games with combat, roguelike chess variants, and games where pieces have abilities/stats.

So I wouldn't claim:

> "Nobody has ever made anything remotely like this."
> 

But your particular combination—chess movement/position determining RPG combat participants, with interactive PvP dodging and combat outcomes feeding buffs/debuffs back into the chess game—is distinctive enough to be worth prototyping.

The specific combat system is where you could make it genuinely yours.

And honestly, I'd avoid thinking about originality as "has someone ever combined chess and RPGs?" The much more useful question is:

> Can a player experience 30 seconds of this game and immediately understand why it couldn't just be ordinary chess or an ordinary RPG?
> 

Your "the board determines the party" concept has that potential.

---

One design change I'd seriously consider

Instead of every successful attack automatically giving a buff, make combat have a resource:

Momentum

Successful attacks generate Momentum.

Successful dodges generate Counter-Momentum or Resolve.

Then players spend those resources on combat abilities.

That gives you:

Chess position → encounter composition → combat decisions → resource generation → persistent piece state → next chess decision.

That's a much more compelling loop than simply:

> hit = +buff
dodge = +debuff
> 

And it gives you a ton of room for different piece archetypes.

If you want, I can take your idea and design the actual ruleset for a playable prototype—board rules, combat UI, HP/damage, dodge mechanics, how pieces join fights, buffs/debuffs, roguelike upgrades, and how to prevent the RPG layer from destroying chess strategy.

ME → just look on internet why similar games arent popular or what i can maybe look to do differently than them if i do that

gpt → 

I dug into the existing games, and there’s a very important discovery for your idea:

Your broad premise is already being made — but your specific combat concept still looks meaningfully different.

There are actually two games coming in October 2026 that are extremely close to the broad pitch:

RPG Chess — every capture becomes a 1v1 RPG battle, with stats, elements, abilities, leveling and a roguelite campaign.

Chaos Chess — also makes every capture a battle, with experience, traits, persistent veteran pieces and RPG progression.

So I would not build your game around the pitch "Chess, but captures become RPG battles." That territory is already occupied.

But here's where your idea gets interesting.

---

1. The biggest difference: your battle isn't 1v1

The games I found mostly do:

> Chess move → capture → attacker vs defender
> 

For example, RPG Chess explicitly describes every capture as a 1v1 battle.

Your idea is:

> Chess move → the board determines the entire battle party.
> 

That's a fundamentally different direction.

Imagine:

♜
│
│
♝ ──── ♟ ──── ♞
│
♟

White attacks a black pawn.

Instead of:

White Pawn vs Black Pawn

you could get:

White

Pawn — attacker

Bishop — ranged support

Rook — tank

vs.

Black

Pawn — defender

Knight — counterattacker

Bishop — support

And why those characters participate is determined by their actual chess positioning.

That is much more interesting to me than simply adding RPG stats to chess.

---

1. The other games reveal an important problem: don't bury the chess

Look at Pawnbarian.

It has 91% positive reviews from 450 Steam reviews, so it's clearly a successful little game.

And its design is almost aggressively simple:

> chess movement + cards + dungeon enemies + upgrades.
> 

Its developers even explicitly describe it as having "bite-sized" runs and emphasize that it doesn't need complex builds.

That's a useful lesson.

One player who liked it described the appeal as the density of strategic decisions packed into a tiny experience.

But another highly-rated review criticized the repetition and high difficulty.

So there's a tension:

Chess already has an enormous decision space.

Then RPG systems add:

stats

abilities

equipment

elements

classes

status effects

cooldowns

XP

builds

etc.

You can very easily make a game where the player thinks:

> "I don't know whether I lost because I played bad chess or because my RPG build sucked."
> 

That's dangerous.

---

1. Shotgun King gives you another useful lesson

Shotgun King is much more successful commercially/critically than a lot of chess hybrids: its Steam page currently shows 93% positive across 3,839 English reviews.

Why?

Because it doesn't try to reproduce all of chess.

Its pitch is basically:

> Chess, but you're a king with a shotgun.
> 

The chess rules become the foundation for a very different game.

That's something I'd steal philosophically:

Don't make "Chess + 40 RPG systems."

Make:

> Chess where the chessboard itself becomes the RPG combat system.
> 

That's a much cleaner identity.

---

1. Chess Survivors has another warning

Chess Survivors has 83% positive reviews, but a critic specifically noted two weaknesses:

lack of variety

repetition

people unfamiliar with chess can struggle initially.

Again, there's a pattern.

Chess-based games have a natural audience barrier:

Chess players understand the rules.

Non-chess players can find the movement rules intimidating.

Your game could potentially solve this better than traditional chess hybrids.

For example:

Instead of expecting the player to know that a bishop attacks diagonally, visually show:

BISHOP
╲  ╲  ╲
╲  ╲  ╲
♟

Then tell them:

> "These pieces can join your attack."
> 

Now the RPG system itself teaches the chess geometry.

---

1. Chessaria shows another problem

Chessaria tried a much more traditional "Chess + tactical RPG/adventure" direction.

It has 74% positive Steam reviews from 99 reviews, and its store page advertises a 100-level adventure campaign, quests, tactical setups and online multiplayer.

Interestingly, one reviewer specifically praised the tactical chess side but said that people looking for a fantasy RPG with character advancement/dialogue shouldn't expect that.

That's another warning:

Don't promise an RPG and then essentially deliver chess with pretty animations.

If your combat exists, it needs to actually matter.

---

1. Here's where I think YOUR version could stand apart

I'd make the fundamental rule:

The chessboard creates the RPG party.

Not:

> "I equipped my bishop with Fireball."
> 

Instead:

> "I put my bishop here, therefore it can participate in this battle."
> 

That distinction is huge.

Your RPG layer becomes a spatial system.

---

And I'd take your dodge idea seriously

This is probably the most distinctive part of what you originally described.

Imagine:

White attacks

WHITE PARTY

Pawn — 100 HP
Bishop — 80 HP
Knight — 110 HP

Black party

Pawn — 90 HP
Knight — 100 HP

Combat begins.

White Pawn attacks.

Black player sees:

> HEAVY STRIKE
> 

and gets:

DODGE ← → BLOCK ← → PARRY

The defender actively chooses.

If dodge succeeds:

White's attack misses.

But instead of simply "nothing happens":

Black gains Counter Momentum.

That can be used to:

debuff the attacking pawn

counterattack

retreat

strengthen an ally

manipulate the next exchange

Now the capture isn't deterministic.

---

This creates something the other games don't appear to emphasize:

The defender is actually playing.

That's REALLY important if you're thinking PvP.

RPG Chess currently describes its battles around players secretly queueing commands, then resolving them by speed.

Your system could instead make the combat itself a little mind game.

For example:

WHITE:
"What is he going to do?"

BLACK:
"Is he going to attack?"

WHITE:
"He's expecting my heavy attack.
I'll bait the dodge."

BLACK:
"Okay, I'll block instead."

WHITE:
"Counter."

Now you're getting something almost like:

Chess × RPG × fighting-game mind games.

That's much more interesting.

---

But there's a BIG trap I'd avoid

Don't make every chess capture turn into a 5-minute RPG battle.

Imagine a chess game where you make:

> Pawn takes Pawn
> 

and suddenly:

loading screen

→ choose party

→ select ability

→ watch animation

→ dodge minigame

→ status effects

→ XP screen

→ loot

→ return to board

You've killed the elegance of chess.

I'd aim for something closer to:

Chess move

2–5 second transition

↓

Combat

10–30 seconds

↓

Result

2 seconds

↓

Back to board

The entire encounter should feel like an explosion of the chess move, not a separate game interrupting it.

---

And here's my biggest recommendation

Don't start with 32 pieces.

Make a prototype with:

4×4 or 5×5 board

and maybe:

2 pawns

1 knight

1 bishop

1 king

Each side.

Then test ONE question:

> "Is deciding where I position my pieces more interesting because I know those positions will determine who joins the next combat?"
> 

If the answer is yes, you have something.

If that's fun, then add:

rook

queen

more combat abilities

roguelike upgrades

bosses

persistent progression

etc.

---

One particularly cool possibility

I'd actually make reinforcement range different from attack range.

For example:

A bishop may attack diagonally.

But perhaps it can support a battle from 3 squares away.

A knight could jump into a battle as reinforcement.

A rook could provide a defensive shield along its file.

A queen could participate from enormous range—but doing so exposes her to counterattacks.

Then you're essentially creating:

> Chess positional strategy → party composition → RPG combat
> 

That's a game loop I don't see represented by the direct competitors I found.

---

My current read after looking around

Existing approach	What it does	Lesson for you

Pawnbarian	Chess movement + roguelike/card combat	Keep the rules dense and simple
Shotgun King	Chess transformed into a new action system	A strong central gimmick beats feature bloat
Chessaria	Chess + tactical adventure	Don't rely on presentation to make it feel like an RPG
RPG Chess	Capture → 1v1 RPG battle + abilities/elements/roguelite	Don't compete directly with this formula
Chaos Chess	Capture → battle + persistent piece progression	Persistent veteran pieces aren't enough by themselves
Your concept	Position → multiple combatants → active combat/dodging → chess consequences	This is the direction I'd investigate

The funny part is that RPG Chess is scheduled for October 27, 2026, while Chaos Chess is also targeting October 2026, so you're actually arriving at a moment where this exact broad genre is becoming crowded.

That makes differentiation more important than originality in the abstract.

And I think your strongest differentiator isn't "roguelike chess RPG."

It's:

> "Every chess position is also a battlefield."
> 

That's the sentence I'd prototype around.

If you want, I can next go one level deeper and look specifically through Steam reviews/discussions for RPG Chess, Chaos Chess, Pawnbarian, Shotgun King etc. and extract what players actually complain about / praise, rather than just looking at their store descriptions. That would give you a much more concrete "here's what NOT to do" list.

ME → what i mean the peices who can directly attack the attacking and defending peices repectively can join their party respectively and what im thinking the id keep different skins that determine basic moveset etc for the whole chess set for example i choose samurai chess set thats me and you choose shunobi skins the only difference is that off the movesets and passives , and yes i wanna preserve the chess aspect of the game also give me what not to do list

GPT → 

Yes — that clarification makes the concept much cleaner.

You're not saying "nearby pieces can join." You're saying:

> When Piece A attacks Piece B, every piece that could legally capture/attack A joins B's side, and every piece that could legally capture/attack B joins A's side.
> 

So the chess attack graph determines the RPG party.

That is a much more elegant rule because the combat participants are literally derived from chess. You aren't bolting an arbitrary party system onto chess.

And I really like your skin/set idea too. It gives you a way to make the game visually and mechanically expressive without destroying competitive fairness.

For example:

Samurai set

Pawn → Ashigaru

Knight → Samurai Rider

Bishop → Onmyoji

Rook → Castle Guardian

Queen → Shogun

King → Daimyo

vs.

Shinobi set

Pawn → Shinobi

Knight → Assassin

Bishop → Ninjutsu caster

Rook → Ninja fortress

Queen → Kunoichi master

King → Clan leader

Both have the same chess identity, but the set changes their combat moves/passives.

I'd structure it around a very strict rule:

> Cosmetic sets can change the expression and combat kit, but never the underlying chess movement.
> 

That protects the chess aspect.

---

The "Do NOT do this" list

This is where I'd be particularly careful, because your biggest danger isn't lack of features.

It's accidentally making a bad RPG that happens to have a chessboard.

1. ❌ Don't let RPG stats override chess skill

Don't make:

> My level 15 Pawn has 300 HP, therefore your strategically superior Pawn loses.
> 

The board should always matter.

A strong chess position should create a meaningful combat advantage.

RPG progression should modify how you exploit that advantage, not determine who deserves it.

---

1. ❌ Don't make the combat participants arbitrary

Your current idea is actually elegant:

> "Who can attack whom?"
> 

determines:

> "Who joins the battle?"
> 

Keep that.

Don't eventually add:

> "Click these three pieces to form your party."
> 

That destroys the most interesting connection between chess and RPG combat.

The player should constantly be thinking:

> "If I move here, who will be able to participate in the inevitable fight?"
> 

That's chess strategy becoming RPG strategy.

---

1. ❌ Don't let players move pieces during combat

This is important.

Once combat starts, the board position should freeze.

Otherwise:

> Chess move → RPG battle → move chess pieces around → RPG battle
> 

and you've essentially created two games fighting each other.

Instead:

Chess phase

↓
Choose move

↓
Battle generated from that position

↓
Combat

↓
Return to board

The board is the battlefield configuration.

---

1. ❌ Don't make every piece attack every other piece in combat

If six pieces participate, don't turn it into:

> six characters × six targets × 12 abilities.
> 

Combat will become exhausting.

You need a hierarchy.

For example:

Primary combatant

The piece that initiated the attack.

Defender

The piece being attacked.

Supporters

Pieces that can directly attack one of those two pieces.

Then perhaps supporters have restricted actions.

Something like:

SUPPORT
↓
ATTACKER → TARGET
↑
SUPPORT

The two pieces actually fighting are the stars.

Everyone else modifies the fight.

That preserves the importance of the original chess move.

---

1. ❌ Don't make reinforcements free

This could become your most important balancing problem.

Imagine:

White:
Queen
Rook
Bishop
Knight
Pawn

```
    ↓
```

Black Pawn

If all four White pieces can participate, suddenly your pawn isn't really fighting a pawn.

It's fighting a raid boss.

Instead, more attackers should not necessarily mean more raw damage.

Maybe reinforcements provide:

one support action

defensive buffs

interrupts

combo opportunities

positional effects

rather than simply:

> +100 damage.
> 

That makes having more pieces involved powerful without making it automatically decisive.

---

1. ❌ Don't make the Queen simply "the strongest RPG character"

This is a trap.

If Queen = gigantic HP + gigantic damage + every ability, then chess already tells everyone:

> "Queen good."
> 

You don't need to duplicate that.

Instead, give pieces different tactical identities.

For example:

Pawn

Low power, excellent buffs, promotion mechanic.

Knight

Burst damage / mobility / dodging.

Bishop

Support / ranged attacks / status effects.

Rook

Defense / protection / counterattack.

Queen

Versatility / combos.

King

Extremely important but mechanically unusual.

That makes chess piece choice meaningful without simply translating chess value into RPG stats.

---

1. ❌ Don't allow skins to become pay-to-win

Your Samurai vs Shinobi idea is excellent if handled carefully.

The moment you sell:

> Samurai set = +10% attack
> 

you've got a problem.

Instead:

Samurai

Passive: Bushido
Rewards aggressive attacks.

Moves:

Iaijutsu

Defensive Stance

Rising Slash

Shinobi

Passive: Shadow
Rewards successful dodges.

Moves:

Smoke Screen

Poison Kunai

Substitution

Neither should simply be:

> "Samurai = stronger."
> 

They should create different playstyles.

Then your competitive player can legitimately say:

> "I prefer Shinobi because I like reactive combat."
> 

rather than:

> "I need to buy the stronger set."
> 

---

1. ❌ Don't make 50 skins at launch

You could easily fall into:

> Samurai
Ninja
Viking
Roman
Cyberpunk
Demon
Egyptian
Pirate
Angel
Dragon
...
> 

before you've proven the actual game.

Don't.

I'd start with two sets.

Samurai

Aggressive / disciplined / counterattacks.

Shinobi

Dodging / deception / debuffs.

If those two sets create noticeably different gameplay while the underlying chess remains intact, you have something worth expanding.

---

1. ❌ Don't turn combat into a giant menu

This is probably my #1 UX concern.

You don't want:

Attack
Abilities
Inventory
Equipment
Status
Party
Formation
Skills
Items
Tactics
Stats
Passives

every time a pawn captures something.

Chess is beautiful partly because its rules are comprehensible.

I'd want the combat interface to be immediately readable:

BLACK
♞       ♟
↓
WHITE     ♙ ← attacker
♝

Then:

Your turn

> ⚔ Attack
🛡 Defend
✦ Ability
> 

That's enough.

---

1. ❌ Don't make battles too long

This is crucial.

Imagine a 40-move chess game.

If there are 20 captures...

and every capture takes 90 seconds...

That's 30 minutes of combat.

You've created a slog.

I'd aim for the combat itself to generally be:

5–20 seconds

for a normal encounter.

Big encounters can take longer.

But the player should constantly feel:

> Chess → explosion → chess → explosion → chess
> 

rather than:

> Chess → RPG → RPG → RPG → oh yeah, chess.
> 

---

1. ❌ Don't make dodging purely random

Your original PvP idea is interesting.

But:

> 30% chance to dodge
> 

isn't very satisfying competitively.

I'd much rather have something like:

Attacker

Chooses:

Quick / Heavy / Feint

Defender

Chooses:

Dodge / Block / Counter

And there are interactions.

For example:

Attacker	Defender	Result

Quick	Dodge	Dodge succeeds
Quick	Block	Small damage
Heavy	Dodge	Dodge succeeds, attacker exposed
Heavy	Block	Block breaks
Feint	Dodge	Attacker punishes dodge
Feint	Counter	Defender wins

Now you've got a tiny mind game inside the chess move.

And importantly:

skill > RNG.

You could still add some randomness around damage/status effects, but don't let the core PvP decision be a coin flip.

---

1. ❌ Don't let combat erase chess consequences

This is probably the most important philosophical rule.

Suppose I make a brilliant chess move that attacks your bishop.

The resulting battle should make me think:

> "That was a brilliant move."
> 

Not:

> "Well, I got unlucky and lost the RPG encounter."
> 

The chess move should establish the strategic advantage.

Combat should allow players to express tactical skill within that situation.

---

1. ❌ Don't make every battle symmetrical

This is actually an opportunity.

Suppose:

White Pawn attacks Black Pawn.

White has:

> Pawn + Bishop
> 

Black has:

> Pawn + Knight + Rook
> 

That's not necessarily:

> 2v3.
> 

The board position itself could give different roles.

Maybe:

White

Pawn = attacker

Bishop = ranged support

Black

Pawn = defender

Knight = interceptor

Rook = guardian

Now the battle has a tactical story generated directly from the chess position.

That's much more interesting than simply counting bodies.

---

1. ❌ Don't allow players to farm one piece indefinitely

Your roguelike progression creates another potential exploit.

Imagine:

> Keep using the same Knight → Knight gets XP → Knight becomes absurd → protect Knight forever.
> 

Then the optimal chess strategy becomes:

> Never sacrifice your RPG carry.
> 

That's potentially bad for chess.

I'd consider making progression run-wide or temporary, or giving experienced pieces advantages with meaningful risks.

For example:

Veteran

combat ability

but

Wounded

maximum HP

So keeping a piece alive isn't always automatically optimal.

---

1. ❌ Don't make promotion merely "level up"

This is where you have an opportunity to make chess promotion spectacular.

A pawn reaches the opposite side.

Instead of:

> Pawn → Queen
> 

You could have:

> Promotion
> 

and choose a branch.

For Samurai:

Samurai Pawn

→ Ronin
→ Samurai Captain
→ Shogun's Guard

For Shinobi:

Shinobi Pawn

→ Assassin
→ Shadow Master
→ Clan Hunter

But crucially:

The chess rules still say it became a Queen/Rook/Bishop/Knight.

The RPG identity can branch while its chess identity remains intact.

That could be one of your signature systems.

---

1. ❌ Don't make the board just a loading screen for combat

This is the ultimate failure mode.

If players eventually learn:

> "I just need to get into battles because that's where my build matters."
> 

then chess becomes an annoying obstacle between RPG fights.

You want the opposite.

The player should be thinking:

> "Where I place my pieces determines what kind of fight I'm going to have."
> 

That's the heart of the game.

---

The design principle I'd put above your entire project

Every RPG mechanic must answer: "How does this interact with chess?"

If you invent a mechanic and the answer is:

> "It makes the RPG combat cooler."
> 

That's not enough.

If the answer is:

> "It changes how I value controlling a square."
> 

Keep it.

---

And your central system could be summarized beautifully

Imagine:

White moves Pawn → attacks Black Pawn.

The game examines the board.

WHITE                         BLACK

Bishop ───────→              ←────── Knight
BATTLE
Pawn ─────────→  ⚔  ←─────── Pawn
Rook ─────────→              ←────── Bishop

The game automatically creates:

White party

Attacking Pawn

Bishop support

Rook support

Black party

Defending Pawn

Knight support

Bishop support

Then you enter a 10–20 second tactical combat.

Combat ends.

The board returns.

And the consequences remain.

That last part is important.

Maybe:

> White Pawn won but received Bleeding.
> 

Now White has to decide:

> "Do I keep advancing this pawn, or do I reposition around the wounded piece?"
> 

That's where your RPG system feeds back into chess.

---

The thing I'd prototype first

Not the roguelike.

Not skins.

Not 100 abilities.

I'd make one tiny playable loop:

8×8 chessboard → legal chess move → determine attacking/defending parties automatically → 5–15 second combat → return to board → repeat.

If that feels good, you've got the foundation.

Then add the Samurai/Shinobi kits.

Then roguelike progression.

Then bosses/PvE.

Then cosmetics.

Because if the fundamental "chess position creates a battle" interaction isn't fun, no amount of progression or skins will save it.

Yes. Based on everything we've discussed, chess should remain the primary strategic layer. The RPG combat is the tactical/skill layer that happens because of the chess position—not a replacement for chess.

Here is the current rules/design document we've effectively arrived at.

♟️ Core Game Rules — Current Version

1. The board is still chess

The game uses a normal chessboard and the fundamental chess movement rules remain intact.

Pawns move/capture normally.

Knights move normally.

Bishops move normally.

Rooks move normally.

Queen moves normally.

King moves normally.

The player should still need to understand:

positioning

threats

material

initiative

forks

pins

discovered attacks

sacrifices

promotion

controlling important squares

etc.

The RPG layer does not replace chess strategy.

---

1. A chess attack initiates an engagement

Instead of:

> ♟ → ♟ = instant capture
> 

you get:

> ♟ → ♟ = combat engagement
> 

The attacking piece and defending piece enter combat.

The piece is not automatically destroyed.

This is one of the biggest departures from conventional chess.

---

1. The board determines who joins the battle

This is your most important unique mechanic.

When:

> Piece A attacks Piece B
> 

the game examines the current chess position.

Attacking side

Any allied piece that can directly attack the defending piece can participate on the attacking side.

Defending side

Any allied piece that can directly attack the attacking piece can participate on the defending side.

So the board itself generates the parties.

Example:

White Bishop
↓
White Knight → Black Pawn ← Black Rook
↑
White Pawn

If White Pawn attacks Black Pawn:

White combatants are determined by which White pieces can directly attack the relevant target.

Black combatants are determined by which Black pieces can directly attack the attacking Pawn.

So party composition is not manually selected.

It emerges from the chess position.

---

1. The original attacking and defending pieces are the main combatants

The piece that initiated the attack and the piece that was attacked are the center of the encounter.

Supporting pieces can participate, but you don't want the fight to become:

> "Six completely independent RPG characters fighting simultaneously."
> 

The primary pieces remain important.

This preserves the meaning of:

> Pawn attacks Pawn
> 

rather than turning it into a generic party battle.

---

1. Combat is turn-based

The combat itself is RPG-like and turn-based.

Players make combat decisions rather than simply watching an automatic chess capture animation.

Possible actions can eventually include things like:

attacks

abilities

defensive actions

support actions

buffs

debuffs

counters

disengagement

The exact action list still needs prototyping.

---

1. Defense has a mechanical timing component

This is where your Clair Obscur: Expedition 33 inspiration comes in.

Instead of simply choosing:

> "Dodge: 25% chance"
> 

the defender can actually time defensive actions.

Potential hierarchy:

Dodge

→ avoid an attack.

Perfect Dodge

→ better reward/resource.

Parry

→ precisely timed defense that can negate/stagger.

Counter

→ successful defensive timing creates an offensive opportunity.

The exact windows and mechanics still need testing.

The important principle is:

> Player execution should matter.
> 

---

1. Combat should not be dominated by RNG

We discussed avoiding situations where:

> "I lost because the game rolled a 12% dodge."
> 

Instead, important combat outcomes should primarily come from:

prediction

timing

tactical choices

piece abilities

chess position

Randomness can exist around secondary things, but the core PvP interaction should be skill-based.

---

1. Players can disengage

This is a major rule you've introduced.

Combat does not necessarily continue until a piece dies.

Either player can decide:

> I don't want to continue this engagement.
> 

They can disengage/retreat according to whatever eventual retreat rules we establish.

Therefore:

> Chess attack ≠ guaranteed capture.
> 

An attack creates an opportunity to fight.

The players decide how far they want to take it.

---

1. Retreat should have consequences

Otherwise players could constantly attack, gather information, and immediately leave without risk.

So we're considering some form of cost, such as:

fatigue

temporary weakness

lost combat resources

temporary inability to initiate another engagement

accumulated injury

This is not finalized yet.

But the design principle is:

> Retreat preserves your piece but should not be completely free.
> 

---

1. Winning combat doesn't necessarily mean destroying every opponent

You can win an engagement without necessarily killing the enemy.

For example, you could:

force the opponent to retreat

inflict injuries

gain Momentum

apply debuffs

gain buffs

force positional concessions

Destroying a piece should nevertheless be a major strategic reward.

---

1. Combat feeds consequences back into chess

This is extremely important.

After combat:

You return to the chessboard.

But combat consequences remain.

For example:

> Pawn gains Blood Oath
> 

or:

> Knight gains Wounded
> 

or:

> Bishop gains Momentum
> 

or:

> Pawn becomes temporarily exhausted.
> 

Those consequences affect your next chess decisions.

So the loop becomes:

Chess → Combat → Consequences → Chess

rather than:

Chess → random minigame → reset → Chess.

---

1. Buffs and debuffs are generated through combat

Your original idea was:

> Successful attack → attacking player gets a buff.
> 

and:

> Successful dodge → defender can apply a debuff to the attacking pawn.
> 

We've refined that toward a broader combat-resource system.

For example:

Normal hit

→ damage

Critical/perfect attack

→ stronger reward

Perfect dodge

→ Momentum

Perfect parry

→ Stagger / combat advantage

Counter

→ large reward

The exact buff/debuff catalogue isn't finalized.

---

1. Chess position should influence combat power

A player who creates a good chess position should generally enter combat with meaningful advantages.

For example:

3 attacking pieces vs 1 defender

should feel substantially different from:

1 attacker vs 3 defenders.

But numerical superiority shouldn't automatically equal victory.

A mechanically skilled player should have opportunities to survive/outplay a disadvantage.

Thus:

Chess determines the situation.

Combat determines how well you exploit/survive that situation.

---

1. The game has two types of skill

This is important to your identity.

Strategic skill

Chess:

> Where should I move?
> 

> What should I attack?
> 

> What squares should I control?
> 

> What happens if I engage?
> 

> What pieces can join?
> 

Tactical/mechanical skill

Combat:

> Can I read this attack?
> 

> Can I dodge?
> 

> Can I parry?
> 

> Can I counter?
> 

> Should I commit or retreat?
> 

A strong player needs both.

---

1. The board itself becomes a party-building system

This is probably the strongest conceptual summary of your idea.

You don't say:

> "I'll build a party with Knight + Bishop + Rook."
> 

You say:

> "I'll position my Knight, Bishop and Rook so that they participate in the engagement I want."
> 

That's chess strategy directly creating RPG strategy.

---

1. Chess pieces retain their identities

Pieces shouldn't simply become:

> Queen = biggest RPG character.
> 

They should have distinct combat identities.

Possible direction:

Pawn

simple

adaptable

promotion-related mechanics

Knight

mobility

burst

evasive combat

Bishop

ranged/support

status effects

Rook

defense

protection

powerful positioning

Queen

versatility

combination abilities

King

unique high-value mechanics

These are still only design directions—we haven't finalized their kits.

---

1. Skins/sets change the combat movesets

This is your Samurai vs Shinobi system.

You choose an entire chess set.

For example:

Samurai

Pawn → Ashigaru
Knight → Samurai Rider
Bishop → Onmyoji
Rook → Castle Guardian
Queen → Shogun
King → Daimyo

Shinobi

Pawn → Shinobi
Knight → Assassin
Bishop → Ninjutsu user
Rook → Ninja defender
Queen → Kunoichi master
King → Clan leader

The important rule:

> The underlying chess movement stays the same.
> 

The Samurai Pawn still behaves as a chess pawn.

The Shinobi Pawn still behaves as a chess pawn.

Their combat abilities/passives differ.

---

1. Different sets should represent playstyles, not power tiers

This is particularly important for PvP.

We don't want:

> Samurai = +20% damage
> 

and therefore everyone buys Samurai.

Instead:

Samurai

Could emphasize:

parry

counterattack

aggression

Resolve

Shinobi

Could emphasize:

dodge

deception

debuffs

evasiveness

Different sets should make players say:

> "I like playing this way."
> 

not:

> "This one is statistically stronger."
> 

---

1. Cosmetics shouldn't invalidate competitive fairness

The visual appearance can change dramatically.

But the fundamental chess rules remain equal.

A Samurai Queen and Shinobi Queen still have the same chess movement possibilities.

Their combat gameplay can differ within carefully balanced boundaries.

---

1. Roguelike progression happens around this system

We discussed having progression during a run rather than simply making a permanently stronger account.

Pieces could acquire things such as:

abilities

traits

temporary buffs

injuries

veteran status

branching upgrades

But we identified a major danger:

> Don't allow one piece to become an invincible RPG carry that you protect at all costs.
> 

That could destroy chess strategy.

So progression needs to interact with the board without overpowering it.

---

1. Promotion can become a major RPG event

A pawn reaching the opposite side remains a chess promotion.

But its RPG identity could potentially branch.

For example:

Samurai Pawn

→ Ronin
→ Samurai Captain
→ elite warrior

while still receiving a valid chess promotion.

This could make promotion one of the most exciting moments in a run.

---

1. Combat should be short

We haven't established an exact duration, but the principle we discussed was:

> Don't make every chess move turn into a five-minute RPG battle.
> 

Normal encounters should ideally feel like:

Chess decision → short burst of combat → consequence → back to chess.

The player should never forget they're playing a chess-based game.

---

1. Combat should have strong feedback

This is where you can get the excitement you're looking for from games like Valorant/COD without turning the game into an FPS.

Things like:

perfect dodge

parry

counter

critical

combo

successful retreat

piece defeat

promotion

clutch survival

should have excellent audiovisual feedback.

The thinking is:

> Deep chess decisions + immediate combat feedback.
> 

---

1. The game should NOT become "RPG with a chess minigame"

This is the single most important design rule.

Every RPG system should reinforce the chess layer.

If you add a mechanic, ask:

> "Does this make chess positioning more interesting?"
> 

If yes → potentially good.

If it only makes RPG combat more complicated → reconsider it.

---

So... is chess still the main strategy?

I'd actually define your game as having a hierarchy:

Yes. And it should be unmistakably so.

Layer 1 — Chess = Strategy

This is the macro game.

You determine:

positioning

threats

attacks

defenses

sacrifices

party composition

engagement conditions

promotion

long-term board control

↓

Layer 2 — Combat = Tactics

This is the micro game.

You determine:

attacks

abilities

dodges

parries

counters

buffs/debuffs

commitment vs retreat

↓

Layer 3 — Execution = Skill

You physically execute:

timing

reactions

prediction

combat decisions

And then:

Combat consequences return to Layer 1.

---

The ideal situation is this:

A chess grandmaster who is terrible at combat shouldn't automatically beat a mediocre chess player who is amazing at combat.

But the combat god shouldn't be able to completely ignore chess either.

If someone makes terrible chess decisions and enters every battle:

> 1v4
> 

they should be in serious trouble regardless of how good their parries are.

Conversely, an excellent chess player should be able to manufacture:

> 3v1
> 

situations and gain substantial advantages.

That's how I would preserve chess as the main strategic layer.

The simplest description of your game right now would be:

> A competitive chess game where every attack creates a short, skill-based RPG engagement, and the chess position determines who participates in that engagement. Players can fight, outplay, or disengage—and the consequences return to the chessboard.
> 

That's considerably more distinctive than simply "chess with RPG combat."

The biggest rules still needing actual prototyping are the exact reinforcement definition, retreat penalties, combat turn structure, and how much a support piece can do. Those are the areas where we'll discover whether the concept genuinely works rather than just sounding good on paper.
