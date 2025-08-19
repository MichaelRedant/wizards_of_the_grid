# Wizards of the Grid — Codex Agents

> Centrale promptbibliotheek met gespecialiseerde “agents” voor het project **Wizards of the Grid** (React + Vite + TS + Tailwind v4 + Zustand).

---

## 0) Projectkaders

**Stack**
- React + TypeScript (Vite)
- Tailwind CSS v4 via `@tailwindcss/vite` (geen PostCSS-config nodig)
- Zustand voor state
- Node 18+ (of hoger), Vite 7+

**Belangrijke conventies**
- **Tailwind v4**: gebruik de Vite plugin (`@tailwindcss/vite`). Vermijd `@apply` tenzij je `@reference` correct configureert. In dit project houden we **utility-only** in JSX.
- **TypeScript**: `verbatimModuleSyntax` actief. Gebruik **type-only imports** (`import type { Foo } from "..."`).
- **State**: `zustand` in `src/store/useGameStore.ts`.
- **Mappen**
src/
components/
game/
store/
utils/


- **Build/Run**
```bash
npm i
npm run dev
npm run build


Definition of Done (DoD)

npm run dev start zonder fouten of warnings in console.

Geen TypeScript errors.

Board rendert, selecteren/verplaatsen werkt, DM-log schrijft acties.

Nieuwe code bevat volledige bestandsnamen en paden in de uitleg.

Commit message volgt conventie

---


2) Agentenoverzicht
Agent 1 — Senior React Architect

Doel: Componentarchitectuur, props/state-ontwerp, afkappen van complexiteit.

Gebruik wanneer: Nieuwe features, herstructurering, performance-overwegingen.

Input:

Featurebeschrijving of probleem

Huidige relevante bestanden

Output:

Mappen- en componentdiagram

Volledige codeblokken met paden

Checklist met randgevallen

Prompt:

[AGENT: Senior React Architect]
Context: Wizards of the Grid (React+TS, Vite, Tailwind v4, Zustand).
Taak: Ontwerp en implementeer [feature X].
Vereisten:
- Toon componenthiërarchie en dataflow.
- Lever volledige code met paden (vervanging).
- Houd state in Zustand, UI stateless waar mogelijk.
- Tailwind utilities in JSX, geen @apply.
- Type-only imports respecteren.

Agent 2 — Game Rules Designer

Doel: Spelregels, movement, combat, abilities, terrain.

Gebruik wanneer: Aanpassen/uitbreiden van regels of abilities.

Input: Gewenste mechaniek (bv. stun, poison, AoE, cooldowns).

Output: Aangepaste game/* bestanden met volledige code.

Prompt:

[AGENT: Game Rules Designer]
Wijzig spelmechaniek: [beschrijf wijziging].
Pas aan in:
- src/game/chess.ts (beweging/legale zetten)
- src/game/abilities.ts (abilities)
- src/game/types.ts (types)
Geef ALLE aangepaste bestanden volledig. Voeg tests in DMLog toe waar relevant.

Agent 3 — Zustand State Engineer

Doel: Store-logica, acties, side-effects minimaliseren, pure updates.

Gebruik wanneer: Nieuwe acties, undo/redo, persistence, session history.

Output: Volledige src/store/useGameStore.ts updates met uitleg.

Prompt:

[AGENT: Zustand State Engineer]
Taak: Voeg [actie X] toe en werk state transities bij.
Lever:
- Volledige vervanging van src/store/useGameStore.ts
- Uitleg over invariants en edge cases

Agent 4 — Tailwind v4 UI Mechanic

Doel: Styling, layout, theming in Tailwind v4 zonder PostCSS-gedoe.

Gebruik wanneer: UI-glitches, refactors naar utilities, dark mode, responsiveness.

Output: Componentcode met Tailwind utilities in JSX.

Prompt:

[AGENT: Tailwind v4 UI Mechanic]
Probleem/Feature: [uitleg].
Eis:
- Gebruik @tailwindcss/vite, geen @apply.
- Toon volledige componenten met nieuwe classes.

Agent 5 — Performance & Rendering Profiler

Doel: Re-render reductie, memoization, selector optimalisatie.

Gebruik wanneer: Haperingen, te veel renders, grote lijsten.

Output: Concreet meetplan en code aanpassingen (React.memo, selectors, derived state).

Prompt:

[AGENT: Performance Profiler]
Symptoom: [vb. trage updates bij bewegen].
Analyseer:
- Re-render hotspots
- Zustand selectors
Lever:
- Volledige codeblokken met memoization en selectors
- Meetplan (React Profiler stappen)

Agent 6 — AI Opponent Strategist

Doel: Baseline AI tegenstander (heuristiek/minimax-lite), met abilities.

Gebruik wanneer: Singleplayer nodig is.

Output: Nieuwe module src/game/ai.ts + integratie in store.

Prompt:

[AGENT: AI Opponent Strategist]
Doel: Simple AI (depth 1-2) met ability heuristics.
Lever:
- src/game/ai.ts (volledige inhoud)
- Aanpassingen in src/store/useGameStore.ts (call AI bij black turn)
- Uitleg heuristieken (piece value, kill priority, terrain bonuses)

Agent 7 — UX & Accessibility Specialist

Doel: Focus states, toetsenbordnavigatie, aria, kleurcontrast.

Gebruik wanneer: Toegankelijkheid verbeteren of toetsenbordbesturing.

Output: Componentupdates met aria-attributen, focus traps, tab-index.

Prompt:

[AGENT: UX & A11y Specialist]
Verbeter toegankelijkheid voor [componenten], met:
- aria-labels/roles
- focus styles en keyboard controls
- kleurcontrast
Geef volledige componentcode.

Agent 8 — QA & Bug Hunter

Doel: Strikte bugreproductie, triage, fix met minimal footprint.

Gebruik wanneer: Foutmeldingen, regressies.

Output: Repro-stappen, root cause, patch-diff/volledige file, DoD-checklist.

Prompt:

[AGENT: QA & Bug Hunter]
Bug: [foutmelding/log].
Lever:
- Repro stappen
- Oorzaak
- Fix (volledige file)
- Validatie (wat te testen in UI/console)

Agent 9 — DevOps (Vite/Build/Deploy)

Doel: Build-config, base-path voor subdomein/subfolder, CI.

Gebruik wanneer: Deploy op subdomein of GitHub Pages.

Output: vite.config.ts aanpassingen, GitHub Actions workflow.

Prompt:

[AGENT: DevOps]
Doel: Deploy naar [omgeving].
Lever:
- Volledige vite.config.ts (met base indien subfolder)
- .github/workflows/build.yml (indien gevraagd)
- Stap-voor-stap deploy instructies

Agent 10 — Git & Release Steward

Doel: Branchstrategie, conventionele commits, release notes.

Conventies

Branch: feat/, fix/, refactor/

Commits (Conventional Commits): feat: …, fix: …, chore: …

Prompt:

[AGENT: Git & Release Steward]
Taak: Prepareer release vX.Y.Z.
Lever:
- Changelog (breaking/feat/fix)
- Git-commando’s (tag, push)
- Checklist pre-release (build OK, dev OK, TS OK)

Agent 11 — Docs Writer

Doel: Heldere technische docs met codeblokken en paden.

Gebruik wanneer: Nieuwe features of onboarding.

Output: Markdown in docs/*.md.

Prompt:

[AGENT: Docs Writer]
Schrijf documentatie over [onderwerp].
Lever:
- docs/[onderwerp].md (volledige inhoud)
- Inhoudstafel, codeblokken, commando’s

3) Reusable Prompt Snippets
Component Scaffold
Maak een nieuwe component:
- Bestand: src/components/[Naam].tsx
- Doel: [korte beschrijving]
- Props: [opsomming]
Eisen:
- Tailwind utilities in JSX
- Geen inline styles tenzij nodig
- Type-only imports
Geef volledige file.

Nieuwe Ability
Voeg ability “[naam]” toe:
- Effect: [beschrijf]
- Target: [self/enemy/ally/tile/area]
- Range/Radius: [waarden]
Pas aan:
- src/game/types.ts (eventuele types)
- src/game/abilities.ts (volledig)
- Toon voorbeeld in DMLog

Store-actie
Voeg actie “[naam]” toe aan Zustand:
- State impact: [beschrijf]
- Side-effects: [geen/minimaal]
Wijzig:
- src/store/useGameStore.ts (volledige vervanging)
- Voeg logging toe

UI Thema-variatie
Pas styles aan naar [thema].
Wijzig uitsluitend Tailwind-classes in:
- src/components/[lijst]
Geef volledige componenten.

---


4) Checklists

Code review

 Type-only imports toegepast

 Geen onnodige re-renders (memo/selectors)

 Geen @apply in CSS (tenzij bewust met @reference)

 Store-updates zijn puur; geen mutatie buiten store

 DMLog meldt belangrijke events

 Commit boodschap conventioneel

Release

 npm run build slaagt

 Geen TS errors

 UI rendert bord, stukken, HUD, AbilityBar, DMLog

 Nieuwe features gedocumenteerd in docs/

---


5) Veelvoorkomende valkuilen

Tailwind v4: Gebruik @tailwindcss/vite. Vermijd postcss.config.js. Utility-only is het meest robuust.

Windows/Git Bash: Gebruik forward slashes. NPM/Npx kunnen haperen op OneDrive-paden.

TypeScript: Bij errors met “must be imported using a type-only import” → import type { X } from "...".

---


6) Snelle commando’s
# Dev
npm run dev

# Build
npm run build

# Git
git add -A
git commit -m "feat: beschrijving"
git push

# Nieuwe branch
git checkout -b feat/naam

---


7) Glossarium

Tile: Eén veld op het 8×8 bord.

Piece: Schaakstuk met hp/xp/abilities.

Terrain: heal / arcane / trap / none.

DMLog: Event- en debuglog.

---

8) Roadmap (kort)

AI tegenstander (Agent 6)

LocalStorage save/load

Animaties (Framer Motion)

SFX

Multiplayer (WebSockets)

Meer status-effecten (poison/stun)

Einde van agents.md


---

