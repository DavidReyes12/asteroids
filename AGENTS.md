# AGENTS.md

## Project

Asteroids clone in pure HTML5 Canvas: no framework, no bundler, no dependencies, no tooling (no package.json, test, lint, or CI). All logic lives in one file, `game.js`, loaded as a classic script by `index.html` (fixed 800×600 canvas). README, code comments, and UI strings are Spanish — keep it that way.

## Commands

- Run: `npx serve .` → http://localhost:3000 (per README), or open `index.html` directly in the browser — it works because the script is not a module and nothing is fetched.
- There is no test/typecheck/lint to run. Verification = edit `game.js`, reload the page. Don't add tooling unless asked.

## Conventions

- `game.js` is a plain classic script sharing top-level globals (`ctx`, `keys`, `W`/`H`, entity arrays). No `import`/`export` and no `type="module"` — either breaks the script tag.
- Canvas size lives in two places that must stay in sync: `<canvas width="800" height="600">` in `index.html` and `const W = 800; const H = 600;` in `game.js`. `game.js` never reads the DOM attribute.
- Entity pattern: classes with `update(dt)` + `draw()` and a `dead` flag; arrays are re-filtered each frame after the update loop. All positions wrap at edges via `wrap()` (toroidal world). Loop is delta-time based, `dt` clamped to 0.05s.
- Input: `keys` holds current key state; `pressed(code)` is edge-triggered and consumes the flag (read-once). Arrows/Space get `preventDefault` in the window keydown listener.
- `update()` owns collisions (circle-distance checks) and the state machine (`'playing' | 'dead' | 'gameover'`); a cleared field triggers `nextLevel()`.
- Power-ups and the `estrella fugaz` (shooting-star) asteroid both exist in `game.js`; the README documents them accurately.
