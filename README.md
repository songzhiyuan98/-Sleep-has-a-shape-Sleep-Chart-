# Sleep Chart — Sleep has a shape

An interactive editorial explainer for the Nature paper
[“Sleep chart of biological ageing clocks in middle and late life”](https://www.nature.com/articles/s41586-026-10524-5).

The page turns the study into a one-page data story: a 4–10 hour sleep-duration
control, nine source-anchored U-shaped signals, sex-stratified clock minima,
outcome summaries, statistical pathways, methods, limitations and direct links
to the evidence.

## Scientific guardrails

- The experience describes cohort-level associations, not individual risk,
  biological age or a sleep prescription.
- Nine clocks showed corrected significant nonlinear associations among the 23
  clocks studied.
- All 18 female/male minima come from the paper’s official
  [Source Data workbook](https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-026-10524-5/MediaObjects/41586_2026_10524_MOESM5_ESM.xlsx).
- The Canvas curves are explicitly schematic; exact minima and study statistics
  remain available in semantic HTML.

## Run locally

Node.js `>=22.13.0` is required.

```bash
npm install
npm run dev
```

The local site runs at `http://localhost:3000`.

## Verify

```bash
npm test
npm run lint
```

`npm test` runs strict TypeScript validation, the production vinext build, the
rendered-page contract, all source-data minima checks and responsive source
contracts.

## Structure

- `app/SleepChartExperience.tsx` — semantic story and interactions
- `app/sleep-model.mjs` — verified study constants and pure display logic
- `app/sleep-model.d.mts` — TypeScript declarations for the ESM model
- `app/globals.css` — Nocturnal Plate visual system and responsive states
- `tests/` — rendered HTML, data-model and source-contract tests
- `public/og.png` — bespoke social preview

The site is built with React, vinext, native Canvas and CSS, with no charting or
animation runtime dependency.
