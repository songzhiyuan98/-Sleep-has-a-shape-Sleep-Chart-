# Sleep Chart Nature Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a dynamic, scientifically rigorous one-page explainer for the Nature Sleep Chart paper.

**Architecture:** Keep `app/page.tsx` as the server entry point and render a single client experience component for the range control, canvas plot, study-stratum switch, scroll progress, and citation copy state. Put verified source-data constants and pure sleep-state logic in an ESM module that Node can test directly; keep all visual styling in the global stylesheet and use no runtime data service.

**Tech Stack:** vinext, React 19, Next 16, TypeScript, HTML canvas, CSS view timelines, Node test runner, OpenAI Sites

## Global Constraints

- Preserve the existing vinext and Sites Vite plugin setup.
- Do not add a charting or animation dependency.
- Use associative, cohort-level scientific language and include a non-clinical disclaimer.
- Use exact published counts and Nature source-data minima; do not invent biological-age estimates.
- Keep all page content usable with reduced motion, keyboard input, and touch.
- Remove all starter-preview code, metadata, and dependencies.

---

### Task 1: Research-data and rendering contracts

**Files:**
- Create: `app/sleep-model.mjs`
- Create: `app/sleep-model.d.ts`
- Create: `tests/sleep-model.test.mjs`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `CLOCKS`, `MODALITY_COUNTS`, `getSleepState(hours)`, `getStudyMinimum(clock, stratum)`.
- The client experience consumes those exact exports.

- [ ] **Step 1: Write the failing model tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  CLOCKS,
  MODALITY_COUNTS,
  getSleepState,
  getStudyMinimum,
} from "../app/sleep-model.mjs";

test("maps continuous hours to the paper's analytical categories", () => {
  assert.equal(getSleepState(5.9).key, "short");
  assert.equal(getSleepState(6).key, "reference");
  assert.equal(getSleepState(8).key, "reference");
  assert.equal(getSleepState(8.1).key, "long");
});

test("contains the nine significant clocks and the full modality totals", () => {
  assert.equal(CLOCKS.length, 9);
  assert.deepEqual(MODALITY_COUNTS, { proteomic: 11, metabolomic: 5, mri: 7 });
});

test("preserves representative source-data minima", () => {
  const brainProtein = CLOCKS.find((clock) => clock.id === "brain-prot");
  assert.equal(getStudyMinimum(brainProtein, "female"), 7.82);
  assert.equal(getStudyMinimum(brainProtein, "male"), 7.7);
});
```

- [ ] **Step 2: Run the model tests and confirm the missing-module failure**

Run: `node --test tests/sleep-model.test.mjs`

Expected: FAIL because `app/sleep-model.mjs` does not exist.

- [ ] **Step 3: Replace the starter render test with the final-page contract**

The test must assert:

```js
assert.match(html, /Sleep has a shape\./);
assert.match(html, /494,951/);
assert.match(html, /9 of 23/);
assert.match(html, /Association is not prescription/);
assert.match(html, /nature\.com\/articles\/s41586-026-10524-5/);
assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
```

- [ ] **Step 4: Implement the pure ESM data model**

Implement exact category boundaries and nine source-data rows. The exported
clock objects use:

```js
{
  id: "brain-prot",
  organ: "Brain",
  modality: "proteomic",
  female: 7.82,
  male: 7.70,
  curve: 3.607
}
```

Use the corresponding verified rows for pulmonary, hepatic, immune, skin,
endocrine, brain MRI, adipose, and pancreas.

- [ ] **Step 5: Run the model tests and confirm they pass**

Run: `node --test tests/sleep-model.test.mjs`

Expected: 3 passing tests and 0 failures.

### Task 2: Semantic page and dynamic experience

**Files:**
- Create: `app/SleepChartExperience.tsx`
- Modify: `app/page.tsx`
- Delete: `app/_sites-preview/SkeletonPreview.tsx`
- Delete: `app/_sites-preview/preview.css`

**Interfaces:**
- Consumes: the model exports from `app/sleep-model.mjs`.
- Produces: the complete one-page DOM and client interactions.

- [ ] **Step 1: Implement `SleepChartExperience.tsx`**

The component must:

- initialize `hours` at `7.0` and `stratum` at `female`;
- render an accessible range input with `min=4`, `max=10`, `step=0.1`;
- draw nine schematic U traces on a resize-aware canvas, anchoring each
  minimum to the official source-data value;
- render semantic live status, clock-minimum rows, evidence sections,
  methodology, limitations, links, and citation;
- update `--signal-color` and the three-state highlight without inventing a
  biological-age score;
- support citation copy feedback and reduced motion.

- [ ] **Step 2: Replace the starter page**

`app/page.tsx` must render `<SleepChartExperience />` and contain no
`codex-preview` metadata or preview imports.

- [ ] **Step 3: Remove the disposable starter preview files**

Delete `app/_sites-preview/` after the new page is wired.

- [ ] **Step 4: Run the render contract and observe expected styling-related or metadata failures**

Run: `npm run build && node --test tests/rendered-html.test.mjs`

Expected: semantic page assertions pass; any remaining failure must identify
metadata or removed-dependency work addressed in Task 3.

### Task 3: Nocturnal Plate styling, metadata, and starter cleanup

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `public/favicon.svg`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: responsive layout, motion fallbacks, site metadata, and final icon.

- [ ] **Step 1: Implement the complete responsive stylesheet**

Include:

- the exact Nocturnal Plate colour variables;
- editorial serif / Geist Sans / Geist Mono hierarchy;
- first-viewport hero, curve plate, slider, evidence wings, minima ruler,
  methods paper transition, and evidence footer;
- `:focus-visible`, minimum touch targets, high-contrast state labels;
- `@media (max-width: 900px)` and `@media (max-width: 620px)` adaptations;
- `@media (prefers-reduced-motion: reduce)` disabling all nonessential motion;
- CSS view-timeline reveals with a static fallback.

- [ ] **Step 2: Replace global metadata**

Use request headers in `generateMetadata()` to build an absolute `/og.png`
image URL. Set:

```ts
title: "Sleep has a shape — Sleep Chart"
description:
  "Explore how sleep duration is associated with 23 biological ageing clocks across organs and omics."
```

Set Open Graph, X card, and favicon metadata without any starter marker.

- [ ] **Step 3: Replace the favicon and remove the skeleton dependency**

Run: `npm uninstall react-loading-skeleton`

Confirm the lockfile no longer contains the package.

- [ ] **Step 4: Run the production build and render tests**

Run: `npm test`

Expected: build succeeds and every Node test passes.

### Task 4: Bespoke social preview

**Files:**
- Create: `public/og.png`
- Modify: `app/layout.tsx` only if the generated asset dimensions require a metadata correction

**Interfaces:**
- Produces: one cohesive link-unfurl image matching the final site.

- [ ] **Step 1: Generate exactly one social-card image**

The image must contain the exact text:

```text
SLEEP CHART
SLEEP HAS A SHAPE.
23 BIOLOGICAL AGEING CLOCKS
```

Use the night-ink, warm-bone, lichen, plum, and copper palette with a central
U-shaped scientific trace. No logos, people, medical stock imagery, watermarks,
or invented claims.

- [ ] **Step 2: Inspect the image**

Verify all three text lines are present and spelled correctly, the composition
is legible at social-card scale, and no extra text was invented. Retry at most
once only if unusable.

- [ ] **Step 3: Copy the accepted image to `public/og.png`**

Do not leave the project reference pointing outside the workspace.

- [ ] **Step 4: Re-run the build after wiring the asset**

Run: `npm test`

Expected: build succeeds and every test passes.

### Task 5: Final verification and production publication

**Files:**
- Modify: `.openai/hosting.json` with the exact Sites `project_id`
- Create: deployment archive outside the source tree

**Interfaces:**
- Produces: a saved Sites version and private production deployment URL.

- [ ] **Step 1: Run fresh verification**

Run:

```bash
npm test
npm run lint
```

Expected: both commands exit 0 with no test or lint failures.

- [ ] **Step 2: Review the final source diff against the specification**

Confirm every required section, exact statistic, disclaimer, evidence link,
responsive rule, and reduced-motion rule is present; confirm no starter
preview code remains.

- [ ] **Step 3: Create or reuse the Sites project and persist its opaque ID**

Read `.openai/hosting.json` first. Call `create_site` only when no `project_id`
exists, then persist the returned ID exactly.

- [ ] **Step 4: Commit, push, package, and save the exact validated source**

Use the pushed branch-head SHA as `commit_sha`. Package with the Sites helper,
then save one version from that exact source state.

- [ ] **Step 5: Deploy privately and poll to a terminal state**

Use the private deployment path when access is owner-only. On success, open the
production URL in Codex and return it as the primary deliverable.
