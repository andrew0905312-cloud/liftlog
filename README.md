# LiftLog v4

This version changes LiftLog from one long page into a 5-tab interface:

1. Main
2. Nutrition
3. Add Set
4. Gym History
5. Statistics

Data storage keys remain the same as previous versions, so your sets, routines, and nutrition checks should stay saved in the browser/local PWA storage.

## Update steps

Replace these files in your GitHub Pages project:

- index.html
- style.css
- app.js
- manifest.json
- service-worker.js
- README.md

Then run:

```bash
git add .
git commit -m "Redesign LiftLog with tabbed interface"
git push
```

Open the deployed page with `?v=4` once to force a refresh, for example:

```text
https://andrew0905312-cloud.github.io/liftlog/?v=4
```
