# Sleep Chart Nature Landing Page — Design Specification

## Intent

Create a single-page, globally legible research story for the Nature paper
“Sleep chart of biological ageing clocks in middle and late life.” The page
must let a non-specialist understand the U-shaped finding within seconds, while
giving researchers enough methodological detail and direct access to the paper,
portal, code, and source data.

The user explicitly requested an autonomous, result-only workflow, so visual
direction and implementation choices are resolved here without an intermediate
approval gate.

## Core idea

**Sleep has a shape.**

The site behaves like a Nature figure that has acquired time and interaction.
A continuous U-shaped signal passes through the entire page. Visitors move a
sleep-duration control from 4 to 10 hours and see the selected position travel
across the curve, the study category change, and the nine significant ageing
clocks reveal how their reported sample minima differ.

This is not a health app and must never imply a personal biological-age
estimate, a universal sleep prescription, or causality.

## Scientific guardrails

- Use “associated with,” “linked with,” and “observed,” never “causes.”
- State that 9 of 23 clocks showed statistically significant nonlinear
  associations; do not imply all 23 did.
- Describe 6–8 hours as the study reference category.
- Describe 6.4–7.8 hours as the range of sample- and clock-specific minima,
  not an individual optimum.
- Keep short sleep (`<6 h`), reference (`6–8 h`), and long sleep (`>8 h`)
  continuous on the control; category boundaries are analytical, not biological
  discontinuities.
- Include persistent cohort-level and non-clinical disclaimers.
- Surface limitations: self-reported sleep, observational/cross-sectional
  limits, predominantly European ancestry, variable modality sample sizes,
  residual confounding, and reverse causality not fully excluded.
- Use Nature source data for clock minima and published counts. All page
  graphics are original explanatory renderings; no Nature figure is reproduced
  or adapted.

## Verified study facts used in the page

- Self-reported sleep duration: `n = 494,951` UK Biobank participants.
- 23 biological ageing clocks: 11 proteomic, 5 metabolomic, and 7 MRI clocks
  spanning 17 organs and three data layers.
- Nine significant clocks after the paper’s multiple-testing threshold:
  brain, pulmonary, hepatic, immune, and skin proteomic clocks; endocrine
  metabolomic clock; brain, adipose, and pancreas MRI clocks.
- Reported sample-minimum range: 6.5–7.8 h for the female study stratum and
  6.4–7.7 h for the male study stratum.
- 153 significant genetic correlations among 527 disease endpoints.
- 153 significant prospective clinical associations among 726 endpoints,
  predominantly for short sleep.
- All-cause mortality associations versus 6–8 h: short sleep HR 1.50
  (95% CI 1.44–1.55); long sleep HR 1.40 (95% CI 1.36–1.44).
- Short- and long-sleep patterns showed different paths to late-life
  depression: short sleep was more direct; long sleep showed stronger
  organ-ageing mediation. No exact mediation percentage is used because the
  text and source-data stratifications are not identical.

## Page structure

### 1. Opening instrument — “Sleep has a shape”

A full-viewport editorial hero contains:

- a small Nature / publication dateline;
- the headline “Sleep has a shape.”;
- one-sentence explanation of the cross-organ, multi-omics U-shaped pattern;
- a large `07.0 h` readout;
- an accessible 4.0–10.0 h range control;
- a canvas-rendered field of nine U-like traces whose minima are anchored to
  the official source-data values;
- a vertical cursor and a translucent 6–8 h study-reference band;
- live state text for short, reference, and long patterns;
- four immediate proof points: 23 clocks, 9 significant, 3 data layers,
  494,951 sleep reports.

The chart is explicitly labelled as a schematic overview whose minima are
source-data anchored. It does not display invented biological-age values.

### 2. “Both ends rise”

An editorial three-column sequence explains short, reference, and long sleep.
The currently selected hero state subtly emphasizes the matching column.
Copy consistently uses associative language.

### 3. “The body keeps more than one clock”

The 23 clocks are explained as 11 proteomic, 5 metabolomic, and 7 MRI clocks.
A prominent data ruler shows the nine significant clocks. A segmented control
switches between “Female study stratum” and “Male study stratum.” Each clock
positions its official sample minimum on the 4–10 h scale, grouped by modality
and distinguished with both colour and line pattern.

### 4. “Extremes echo beyond the clocks”

Two asymmetric editorial wings show:

- short sleep: broader systemic genetic and prospective disease associations;
- long sleep: a narrower pattern with more brain-related genetic associations;
- mortality hazard ratios for both, always labelled as associations versus the
  6–8 h study reference.

No individual-risk calculator or extrapolated percentage is shown.

### 5. “Different duration. Different path.”

A two-state pathway diagram contrasts:

- short sleep → stronger direct path to late-life depression;
- long sleep → stronger indirect paths through organ-specific MRI ageing
  clocks.

Lines animate only as an explanatory transition and never change their
scientific meaning.

### 6. “How the chart was built”

A six-step method ribbon explains:

1. self-reported 24-hour sleep duration including naps;
2. imaging, proteomics, and metabolomics;
3. machine-learning biological age gaps;
4. generalized additive models without assuming a curve shape;
5. genetic and prospective disease analyses;
6. mediation and sensitivity analyses.

### 7. “Association is not prescription”

The background shifts from night ink to warm paper. Limitations and scope are
presented as direct annotations rather than warning-card chrome.

### 8. Evidence and citation

Provide:

- Read the Nature paper
- Explore the official SleepChart portal
- View code on GitHub
- View source figures/data on Zenodo
- Download Nature source data
- Copy the complete paper citation

## Visual system

The visual direction is **Nocturnal Plate**: a scientific plate printed at
night, not a biotech dashboard.

- Night ink: `#171218`
- Warm bone: `#F2EBDD`
- Reference lichen: `#C7D66B`
- Short-sleep plum: `#A77AA8`
- Long-sleep copper: `#D86D4A`
- Muted ash: `#928A90`
- Methods paper: `#E7DFD2`
- Body ink: `#241E20`

Typography:

- display: an editorial system serif stack led by Iowan Old Style / Palatino;
- interface and body: Geist Sans;
- numeric and research labels: Geist Mono.

Layout:

- twelve-column desktop rhythm;
- large editorial type, hairline rules, marginal notes, and full-width charts;
- minimal radii; avoid rounded SaaS card grids, glassmorphism, star fields,
  glowing organs, DNA motifs, or decorative medical stock imagery;
- subtle paper grain created in CSS, with no external hero image.

## Motion and interaction

- Slider input is immediate, keyboard operable, and exposes live status text.
- Canvas motion is slow and instrument-like. Geometry does not pulse or distort.
- Scroll-linked reveals use CSS view timelines where supported, with a static
  fallback.
- A thin reading-progress line reuses the active sleep-state colour.
- The citation button reports its copied state through an ARIA live region.
- `prefers-reduced-motion` disables trace drawing and view-timeline movement.
- Canvas is `aria-hidden`; all meaning is duplicated in semantic HTML.

## Responsive behaviour

- Desktop: hero plot and copy share the first viewport; the minimum ruler uses
  the full horizontal scale.
- Tablet: chart becomes a wide plate below the headline; margin notes become
  inline annotations.
- Mobile: the readout and selected state remain above a touch-friendly 44 px
  range track; the nine minima become stacked rows; methodological detail
  remains readable without horizontal scrolling.
- Touch targets are at least 44 px and all hover effects have focus equivalents.

## Technical shape

- Keep the existing vinext / React / Next structure and Sites Vite plugin.
- No backend, persistent state, authentication, or external runtime API.
- Use one server page and one client experience component.
- Store the research data and sleep-state logic in a small ESM module that can
  be tested directly with Node’s built-in test runner.
- Use a canvas only for the decorative/schematic curve field; semantic data is
  rendered as DOM.
- Avoid additional animation or charting dependencies.
- Generate one bespoke social preview image after the final visual direction
  and copy are stable.

## Validation

- Unit-test sleep-state boundaries, exact clock counts and modality counts, and
  the published source-data minima.
- Server-render contract test: title, core statistics, disclaimer, evidence
  links, and absence of starter-preview metadata.
- Run the full production build and tests.
- Verify reduced-motion CSS, range labels, external link safety, and responsive
  rules by source inspection and build output.
