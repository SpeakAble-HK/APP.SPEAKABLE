Original prompt: Also the i want the mini games all inside the treasuremap as well as check point

Notes:
- TreasureMap currently shows checkpoint dots inside the map, but the reusable Checkpoint buttons and mini game selectors are rendered below the map.
- Goal: keep the current challenge/scoring logic, move the mini game controls and checkpoint controls into the map panel.
- Implemented: new mini game cards, legacy mini game list, and compact checkpoint strip now render inside the treasure map image panel.
- Verified: `npm run build` passes. Playwright checks confirmed no console errors, mini game difficulty selection works, and clicking checkpoint 1 opens the challenge.
- Dev server: running at http://127.0.0.1:5174/.
