"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import {
  CLOCKS,
  MODALITIES,
  MODALITY_COUNTS,
  getSchematicHeight,
  getSleepState,
  getStratumRange,
  getStudyMinimum,
  type AgeingClock,
  type StudyStratum,
} from "./sleep-model.mjs";

const NATURE_URL =
  "https://www.nature.com/articles/s41586-026-10524-5";
const DOI_URL = "https://doi.org/10.1038/s41586-026-10524-5";
const PORTAL_URL = "https://labs-laboratory.com/sleepchart/";
const GITHUB_URL = "https://github.com/anbai106/SleepChart";
const ZENODO_URL = "https://doi.org/10.5281/zenodo.17409425";
const SOURCE_DATA_URL =
  "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-026-10524-5/MediaObjects/41586_2026_10524_MOESM5_ESM.xlsx";

const CITATION =
  "The MULTI Consortium, O’Toole, C. K., Song, Z. et al. Sleep chart of biological ageing clocks in middle and late life. Nature (2026). https://doi.org/10.1038/s41586-026-10524-5";

type SignalStyle = CSSProperties & {
  "--signal-color": string;
  "--range-progress": string;
};

function xForHours(hours: number, left: number, width: number) {
  return left + ((hours - 4) / 6) * width;
}

function SignalCanvas({
  hours,
  stratum,
}: {
  hours: number;
  stratum: StudyStratum;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const context = canvas.getContext("2d");
      if (!context) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const left = Math.max(18, rect.width * 0.035);
      const right = Math.max(18, rect.width * 0.035);
      const top = Math.max(24, rect.height * 0.08);
      const bottom = Math.max(30, rect.height * 0.1);
      const plotWidth = rect.width - left - right;
      const plotHeight = rect.height - top - bottom;

      const referenceStart = xForHours(6, left, plotWidth);
      const referenceEnd = xForHours(8, left, plotWidth);
      const referenceGradient = context.createLinearGradient(
        referenceStart,
        0,
        referenceEnd,
        0,
      );
      referenceGradient.addColorStop(0, "rgba(199, 214, 107, 0.035)");
      referenceGradient.addColorStop(0.5, "rgba(199, 214, 107, 0.12)");
      referenceGradient.addColorStop(1, "rgba(199, 214, 107, 0.035)");
      context.fillStyle = referenceGradient;
      context.fillRect(
        referenceStart,
        top,
        referenceEnd - referenceStart,
        plotHeight,
      );

      context.strokeStyle = "rgba(242, 235, 221, 0.1)";
      context.lineWidth = 1;
      for (let row = 0; row <= 4; row += 1) {
        const y = top + (plotHeight / 4) * row;
        context.beginPath();
        context.moveTo(left, y + 0.5);
        context.lineTo(left + plotWidth, y + 0.5);
        context.stroke();
      }

      CLOCKS.forEach((clock, index) => {
        const modality = MODALITIES[clock.modality];
        context.beginPath();
        context.setLineDash([...modality.dash]);
        context.strokeStyle = modality.colour;
        context.globalAlpha = 0.38 + index * 0.035;
        context.lineWidth = index === 0 ? 1.8 : 1.25;

        for (let pixel = 0; pixel <= plotWidth; pixel += 2) {
          const curveHours = 4 + (pixel / plotWidth) * 6;
          const height = getSchematicHeight(curveHours, clock, stratum);
          const y =
            top +
            plotHeight -
            height * plotHeight * 0.78 -
            (index - 4) * 1.15;
          if (pixel === 0) context.moveTo(left + pixel, y);
          else context.lineTo(left + pixel, y);
        }
        context.stroke();

        const minimum = getStudyMinimum(clock, stratum);
        const minimumX = xForHours(minimum, left, plotWidth);
        const minimumHeight = getSchematicHeight(minimum, clock, stratum);
        const minimumY =
          top +
          plotHeight -
          minimumHeight * plotHeight * 0.78 -
          (index - 4) * 1.15;
        context.setLineDash([]);
        context.globalAlpha = 0.85;
        context.fillStyle = modality.colour;
        context.beginPath();
        context.arc(minimumX, minimumY, index === 0 ? 3 : 2.1, 0, Math.PI * 2);
        context.fill();
      });

      const sleepState = getSleepState(hours);
      const cursorX = xForHours(hours, left, plotWidth);
      const cursorGradient = context.createLinearGradient(0, top, 0, top + plotHeight);
      cursorGradient.addColorStop(0, "rgba(255,255,255,0)");
      cursorGradient.addColorStop(0.22, sleepState.colour);
      cursorGradient.addColorStop(0.82, sleepState.colour);
      cursorGradient.addColorStop(1, "rgba(255,255,255,0)");
      context.globalAlpha = 0.9;
      context.strokeStyle = cursorGradient;
      context.lineWidth = 1;
      context.setLineDash([]);
      context.beginPath();
      context.moveTo(cursorX + 0.5, top - 8);
      context.lineTo(cursorX + 0.5, top + plotHeight + 8);
      context.stroke();

      CLOCKS.forEach((clock, index) => {
        const height = getSchematicHeight(hours, clock, stratum);
        const y =
          top +
          plotHeight -
          height * plotHeight * 0.78 -
          (index - 4) * 1.15;
        context.globalAlpha = index === 0 ? 1 : 0.72;
        context.fillStyle = sleepState.colour;
        context.beginPath();
        context.arc(cursorX, y, index === 0 ? 4.3 : 2.6, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
      context.setLineDash([]);
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [hours, stratum]);

  return <canvas ref={canvasRef} className="signal-canvas" aria-hidden="true" />;
}

function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressRef.current?.style.setProperty(
        "transform",
        `scaleX(${Math.min(1, Math.max(0, progress))})`,
      );
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={progressRef} className="reading-progress" aria-hidden="true" />;
}

function ExternalArrow() {
  return <span aria-hidden="true">↗</span>;
}

function Stat({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="hero-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
      <p>{detail}</p>
    </div>
  );
}

function ModalityKey({ modality }: { modality: AgeingClock["modality"] }) {
  const meta = MODALITIES[modality];
  return (
    <span className={`modality-key modality-key--${modality}`}>
      <i aria-hidden="true" />
      {meta.shortLabel}
    </span>
  );
}

export function SleepChartExperience() {
  const [hours, setHours] = useState(7);
  const [stratum, setStratum] = useState<StudyStratum>("female");
  const [pathway, setPathway] = useState<"short" | "long">("short");
  const [copyStatus, setCopyStatus] = useState("");

  const sleepState = useMemo(() => getSleepState(hours), [hours]);
  const stratumRange = useMemo(() => getStratumRange(stratum), [stratum]);
  const rangeProgress = ((hours - 4) / 6) * 100;
  const hourDisplay = hours.toFixed(1).padStart(4, "0");

  const rootStyle: SignalStyle = {
    "--signal-color": sleepState.colour,
    "--range-progress": `${rangeProgress}%`,
  };

  const updateHours = useCallback((value: number) => {
    const next = Math.min(10, Math.max(4, Math.round(value * 10) / 10));
    setHours(next);
  }, []);

  const handleRangeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "PageUp" && event.key !== "PageDown") return;
    event.preventDefault();
    updateHours(hours + (event.key === "PageUp" ? 0.5 : -0.5));
  };

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(CITATION);
      setCopyStatus("Citation copied.");
    } catch {
      setCopyStatus("Copy unavailable. Select the citation text below.");
    }
  };

  return (
    <main className="sleep-chart" data-state={sleepState.key} style={rootStyle}>
      <a className="skip-link" href="#main-content">
        Skip to the research story
      </a>
      <ScrollProgress />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Sleep Chart, back to top">
          <span className="wordmark-mark" aria-hidden="true">
            U
          </span>
          <span>
            Sleep <b>Chart</b>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#shape">The shape</a>
          <a href="#clocks">The clocks</a>
          <a href="#methods">The study</a>
        </nav>
        <a
          className="header-paper-link"
          href={NATURE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Nature paper <ExternalArrow />
        </a>
      </header>

      <div id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span>Nature</span>
              <span>13 May 2026</span>
              <span>Open access</span>
            </p>
            <h1 id="hero-title" aria-label="Sleep has a shape.">
              Sleep has
              <br />
              <em>a shape.</em>
            </h1>
            <p className="hero-deck">
              Across 23 biological ageing clocks, both short and long sleep
              were associated with higher biological age gaps — across organs,
              imaging and molecular data.
            </p>
            <div className="hero-links">
              <a className="text-link text-link--primary" href="#clocks">
                Meet the nine signals <span aria-hidden="true">↓</span>
              </a>
              <a
                className="text-link"
                href={DOI_URL}
                target="_blank"
                rel="noreferrer"
              >
                DOI 10.1038/s41586-026-10524-5 <ExternalArrow />
              </a>
            </div>
          </div>

          <div className="hero-instrument" aria-label="Interactive sleep duration explainer">
            <div className="instrument-meta">
              <span>SCHEMATIC OVERVIEW</span>
              <span>MINIMA ANCHORED TO SOURCE DATA</span>
            </div>
            <figure className="signal-figure">
              <SignalCanvas hours={hours} stratum={stratum} />
              <figcaption>
                Nine significant nonlinear signals. Curves are explanatory;
                dots mark reported sample minima for the selected study stratum.
              </figcaption>
              <div className="plot-axis" aria-hidden="true">
                <span>4 h</span>
                <span>6 h</span>
                <span>8 h</span>
                <span>10 h</span>
              </div>
              <div className="reference-label" aria-hidden="true">
                Study reference
              </div>
            </figure>

            <div className="sleep-control">
              <div className="control-readout">
                <output htmlFor="sleep-hours" aria-live="polite">
                  {hourDisplay}
                  <small>h</small>
                </output>
                <div className="control-state">
                  <span className="state-pip" aria-hidden="true" />
                  <strong>{sleepState.label}</strong>
                  <p>{sleepState.description}</p>
                </div>
              </div>
              <label htmlFor="sleep-hours">Explore reported sleep duration</label>
              <div className="range-wrap">
                <input
                  id="sleep-hours"
                  type="range"
                  min="4"
                  max="10"
                  step="0.1"
                  value={hours}
                  aria-valuetext={`${hours.toFixed(1)} hours, ${sleepState.label.toLowerCase()}`}
                  onChange={(event) => updateHours(Number(event.target.value))}
                  onKeyDown={handleRangeKeyDown}
                />
              </div>
              <div className="range-categories" aria-hidden="true">
                <span>SHORT</span>
                <span>6–8 H REFERENCE</span>
                <span>LONG</span>
              </div>
              <p className="instrument-note">
                Cohort pattern, not a personal biological-age estimate.
              </p>
            </div>
          </div>

          <dl className="hero-stats" aria-label="Study at a glance">
            <Stat
              value="494,951"
              label="Sleep reports"
              detail="Per 24 hours, including naps"
            />
            <Stat
              value="23"
              label="Biological clocks"
              detail="Across 17 organs and systems"
            />
            <Stat
              value="9 of 23"
              label="Significant"
              detail="After correction across 23 tests"
            />
            <Stat
              value="3"
              label="Data layers"
              detail="MRI · proteins · metabolites"
            />
          </dl>
        </section>

        <section className="shape-story section-shell" id="shape" aria-labelledby="shape-title">
          <div className="section-index" aria-hidden="true">
            01 — THE SHAPE
          </div>
          <div className="section-heading reveal">
            <p className="kicker">A systemic U</p>
            <h2 id="shape-title">
              Both ends
              <br />
              rise.
            </h2>
            <p>
              The study did not assume a U in advance. Generalized additive
              models revealed nonlinear associations across imaging and
              circulating molecular signals.
            </p>
          </div>

          <div className="three-states reveal">
            <article
              className="state-chapter state-chapter--short"
              data-active={sleepState.key === "short"}
            >
              <span className="state-number">04—06</span>
              <div className="state-line" aria-hidden="true" />
              <h3>Short sleep</h3>
              <p>
                Below 6 hours, ageing-clock signals rose across multiple body
                systems. Later analyses found the broader disease-association
                profile on this side of the curve.
              </p>
              <span className="state-tag">ASSOCIATED · NOT CAUSAL</span>
            </article>
            <article
              className="state-chapter state-chapter--reference"
              data-active={sleepState.key === "reference"}
            >
              <span className="state-number">06—08</span>
              <div className="state-line" aria-hidden="true" />
              <h3>Study reference</h3>
              <p>
                The nine clock-specific sample minima cluster inside this
                valley — but they do not collapse to one universal number.
              </p>
              <span className="state-tag">ANALYTICAL REFERENCE</span>
            </article>
            <article
              className="state-chapter state-chapter--long"
              data-active={sleepState.key === "long"}
            >
              <span className="state-number">08—10</span>
              <div className="state-line" aria-hidden="true" />
              <h3>Long sleep</h3>
              <p>
                Above 8 hours, biological age gaps also rose. The pattern may
                partly reflect organ-mediated or compensatory processes.
              </p>
              <span className="state-tag">ASSOCIATED · NOT CAUSAL</span>
            </article>
          </div>

          <aside className="shape-callout reveal">
            <span>THE IMPORTANT DETAIL</span>
            <p>
              “Normal” here means the paper’s data-driven 6–8 h comparison
              group. It is not a universal clinical cut-off.
            </p>
          </aside>
        </section>

        <section className="clocks-section section-shell" id="clocks" aria-labelledby="clocks-title">
          <div className="section-index" aria-hidden="true">
            02 — THE CLOCKS
          </div>
          <div className="clocks-intro reveal">
            <div>
              <p className="kicker">One body, many clocks</p>
              <h2 id="clocks-title">
                There is no
                <br />
                magic number.
              </h2>
            </div>
            <div className="clocks-explainer">
              <p>
                These clocks predict age from biological features. The gap
                between predicted and chronological age forms a biological age
                gap, or <strong>BAG</strong>.
              </p>
              <p>
                Only nine of the 23 clocks crossed the study’s corrected
                significance threshold.
              </p>
            </div>
          </div>

          <div className="modality-ledger reveal" aria-label="Composition of the 23 clocks">
            {(
              Object.keys(MODALITY_COUNTS) as Array<
                keyof typeof MODALITY_COUNTS
              >
            ).map((modality) => (
              <div className={`modality-block modality-block--${modality}`} key={modality}>
                <span className="modality-count">{MODALITY_COUNTS[modality]}</span>
                <div>
                  <strong>{MODALITIES[modality].label}</strong>
                  <p>
                    {
                      CLOCKS.filter((clock) => clock.modality === modality)
                        .length
                    }{" "}
                    significant in this study
                  </p>
                </div>
                <div className="clock-ticks" aria-hidden="true">
                  {Array.from({ length: MODALITY_COUNTS[modality] }).map(
                    (_, index) => (
                      <i
                        key={index}
                        data-significant={
                          index <
                          CLOCKS.filter((clock) => clock.modality === modality)
                            .length
                        }
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="minimum-plate reveal">
            <div className="minimum-header">
              <div>
                <span className="plate-label">SAMPLE MINIMUM RULER</span>
                <h3>
                  Nine curves. Nine low points.
                </h3>
                <p>
                  {stratum === "female" ? "Female" : "Male"} study stratum ·
                  rounded range {stratumRange.min.toFixed(1)}–
                  {stratumRange.max.toFixed(1)} h
                </p>
              </div>
              <fieldset className="stratum-control">
                <legend>Choose study stratum</legend>
                {(["female", "male"] as StudyStratum[]).map((value) => (
                  <label key={value} data-selected={stratum === value}>
                    <input
                      type="radio"
                      name="study-stratum"
                      value={value}
                      checked={stratum === value}
                      onChange={() => setStratum(value)}
                    />
                    {value === "female"
                      ? "Female study stratum"
                      : "Male study stratum"}
                  </label>
                ))}
              </fieldset>
            </div>

            <div className="minimum-axis" aria-hidden="true">
              <span>4 h</span>
              <span>6 h</span>
              <span>8 h</span>
              <span>10 h</span>
            </div>

            <div className="minimum-rows">
              {CLOCKS.map((clock) => {
                const minimum = getStudyMinimum(clock, stratum);
                const position = ((minimum - 4) / 6) * 100;
                return (
                  <div
                    className={`minimum-row minimum-row--${clock.modality}`}
                    key={clock.id}
                    style={{ "--minimum": `${position}%` } as CSSProperties}
                  >
                    <div className="clock-name">
                      <ModalityKey modality={clock.modality} />
                      <strong>{clock.organ}</strong>
                      <span>{clock.name}</span>
                    </div>
                    <div className="minimum-track" aria-hidden="true">
                      <i className="reference-band" />
                      <i className="minimum-dot" />
                    </div>
                    <output>{minimum.toFixed(2)} h</output>
                  </div>
                );
              })}
            </div>
            <p className="plate-note">
              Minima are sample- and clock-specific, not individualized
              recommendations. Values are rounded from the official Source Data.
            </p>
          </div>
        </section>

        <section className="outcomes-section section-shell" aria-labelledby="outcomes-title">
          <div className="section-index" aria-hidden="true">
            03 — BEYOND THE CLOCKS
          </div>
          <div className="outcomes-heading reveal">
            <p className="kicker">Systemic echoes</p>
            <h2 id="outcomes-title">
              The curve extends
              <br />
              into health.
            </h2>
            <p>
              Genetic correlations and prospective records linked abnormal
              sleep-duration patterns to endpoints across the body. Short sleep
              carried the broader profile.
            </p>
          </div>

          <div className="outcome-wings reveal">
            <article className="outcome-wing outcome-wing--short">
              <div className="wing-label">
                <span>SHORT</span>
                <span>&lt;6 H</span>
              </div>
              <div className="wing-signal" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <h3>Broader, systemic associations</h3>
              <p>
                Cardiovascular, metabolic, musculoskeletal, psychiatric,
                pulmonary and digestive endpoints all appeared in the
                short-sleep profile.
              </p>
              <dl>
                <div>
                  <dt>Genetic correlations</dt>
                  <dd>153 / 527</dd>
                </div>
                <div>
                  <dt>Prospective associations</dt>
                  <dd>153 / 726</dd>
                </div>
              </dl>
            </article>

            <div className="outcome-centre" aria-hidden="true">
              <span>6–8 H</span>
              <i />
              <small>REFERENCE</small>
            </div>

            <article className="outcome-wing outcome-wing--long">
              <div className="wing-label">
                <span>LONG</span>
                <span>&gt;8 H</span>
              </div>
              <div className="wing-signal" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <h3>More focused brain-related signals</h3>
              <p>
                Genetic correlations were more concentrated in depression,
                schizophrenia, bipolar disorder, ADHD, migraine and related
                phenotypes.
              </p>
              <p className="wing-caveat">
                Long sleep may also mark latent illness or compensation.
              </p>
            </article>
          </div>

          <div className="mortality-strip reveal">
            <div>
              <span className="plate-label">ALL-CAUSE MORTALITY ASSOCIATION</span>
              <p>Adjusted hazard ratio versus the 6–8 h study reference</p>
            </div>
            <div className="mortality-value mortality-value--short">
              <span>SHORT</span>
              <strong>HR 1.50</strong>
              <small>95% CI 1.44–1.55</small>
            </div>
            <div className="mortality-value mortality-value--long">
              <span>LONG</span>
              <strong>HR 1.40</strong>
              <small>95% CI 1.36–1.44</small>
            </div>
            <p className="mortality-note">
              Hazard ratios describe cohort associations, not an individual
              probability of death.
            </p>
          </div>
        </section>

        <section className="pathways-section section-shell" aria-labelledby="pathways-title">
          <div className="section-index" aria-hidden="true">
            04 — DIFFERENT PATHS
          </div>
          <div className="pathways-intro reveal">
            <div>
              <p className="kicker">Late-life depression</p>
              <h2 id="pathways-title">
                Same curve.
                <br />
                Different routes.
              </h2>
            </div>
            <p>
              Structural-equation models suggested that the two tails of the U
              may connect to late-life depression through different statistical
              pathways.
            </p>
          </div>

          <div className="pathway-board reveal" data-pathway={pathway}>
            <div className="pathway-tabs" role="group" aria-label="Choose pathway">
              <button
                type="button"
                aria-pressed={pathway === "short"}
                onClick={() => setPathway("short")}
              >
                Short sleep
              </button>
              <button
                type="button"
                aria-pressed={pathway === "long"}
                onClick={() => setPathway("long")}
              >
                Long sleep
              </button>
            </div>

            <div className="pathway-copy">
              <article data-path="short">
                <span className="pathway-caption">A MORE DIRECT PROFILE</span>
                <h3>Short sleep reaches mood more directly.</h3>
                <p>
                  Most late-life depression associations appeared as direct
                  paths. For LLD1, adipose MRIBAG was the one significant
                  indirect route.
                </p>
              </article>
              <article data-path="long">
                <span className="pathway-caption">A MORE MEDIATED PROFILE</span>
                <h3>Long sleep travels through organs.</h3>
                <p>
                  Brain, adipose and liver MRI ageing clocks carried more of the
                  statistical mediation, consistent with a slower, systemic
                  route.
                </p>
              </article>
            </div>

            <div className="route-diagram" aria-label={`${pathway} sleep pathway diagram`}>
              <div className="route-node route-node--sleep">
                <span>{pathway === "short" ? "SHORT" : "LONG"}</span>
                <strong>Sleep pattern</strong>
              </div>
              <div className="route-lanes" aria-hidden="true">
                <i className="route-line route-line--direct" />
                <i className="route-line route-line--mediated" />
              </div>
              <div className="route-mediators">
                {pathway === "short" ? (
                  <div className="mediator-node">
                    <span>ADIPOSE</span>
                    <strong>MRIBAG</strong>
                  </div>
                ) : (
                  <>
                    <div className="mediator-node">
                      <span>BRAIN</span>
                      <strong>MRIBAG</strong>
                    </div>
                    <div className="mediator-node">
                      <span>ADIPOSE</span>
                      <strong>MRIBAG</strong>
                    </div>
                    <div className="mediator-node">
                      <span>LIVER</span>
                      <strong>MRIBAG</strong>
                    </div>
                  </>
                )}
              </div>
              <div className="route-lanes route-lanes--exit" aria-hidden="true">
                <i className="route-line route-line--direct" />
                <i className="route-line route-line--mediated" />
              </div>
              <div className="route-node route-node--outcome">
                <span>LLD 1 / 2</span>
                <strong>Late-life depression</strong>
              </div>
            </div>
            <p className="pathway-disclaimer">
              Statistical mediation is not proof of a causal mechanism.
            </p>
          </div>
        </section>

        <section className="methods-section" id="methods" aria-labelledby="methods-title">
          <div className="section-shell">
            <div className="section-index" aria-hidden="true">
              05 — THE STUDY
            </div>
            <div className="methods-heading reveal">
              <p className="kicker">How Sleep Chart was built</p>
              <h2
                id="methods-title"
                aria-label="One sleep question. Three biological layers."
              >
                One sleep question.
                <br />
                Three biological layers.
              </h2>
              <p>
                Participants answered: “About how many hours sleep do you get
                in every 24 h?” — including naps. Different biological
                measurements came from different subsets.
              </p>
            </div>

            <div className="sample-ledger reveal" aria-label="Study measurement counts">
              <div>
                <span>SELF-REPORTED SLEEP</span>
                <strong>494,951</strong>
              </div>
              <div>
                <span>MRI AVAILABLE</span>
                <strong>43,135</strong>
              </div>
              <div>
                <span>PROTEOMICS AVAILABLE</span>
                <strong>50,316</strong>
              </div>
              <div>
                <span>METABOLOMICS AVAILABLE</span>
                <strong>274,247</strong>
              </div>
              <div>
                <span>GENETIC ANALYSIS</span>
                <strong>342,341</strong>
              </div>
            </div>
            <p className="sample-note reveal">
              Available measurement counts are not the same as complete-case
              samples for every model; not every participant contributed to
              every clock.
            </p>

            <ol className="method-steps reveal">
              <li>
                <span>01</span>
                <h3>Measure sleep</h3>
                <p>Self-reported hours per 24 h at UK Biobank baseline.</p>
              </li>
              <li>
                <span>02</span>
                <h3>Read the body</h3>
                <p>MRI, 2,923 plasma proteins and 327 metabolites.</p>
              </li>
              <li>
                <span>03</span>
                <h3>Build 23 clocks</h3>
                <p>Nested cross-validation estimates biological age gaps.</p>
              </li>
              <li>
                <span>04</span>
                <h3>Let shape emerge</h3>
                <p>GAMs test nonlinearity without prescribing a U.</p>
              </li>
              <li>
                <span>05</span>
                <h3>Follow outcomes</h3>
                <p>Genetic correlation, incident disease and survival.</p>
              </li>
              <li>
                <span>06</span>
                <h3>Probe direction</h3>
                <p>Mediation, Mendelian randomization and sensitivity tests.</p>
              </li>
            </ol>

            <div className="bag-definition reveal">
              <span>BAG</span>
              <p>
                Predicted biological age minus chronological age, modelled here
                in normalized units. It should not be read directly as “years
                older.”
              </p>
            </div>
          </div>
        </section>

        <section className="limits-section" aria-labelledby="limits-title">
          <div className="section-shell">
            <div className="section-index" aria-hidden="true">
              06 — READ THE BOUNDARIES
            </div>
            <div className="limits-heading reveal">
              <p className="kicker">Interpretation matters</p>
              <h2 id="limits-title">Association is not prescription.</h2>
              <p>
                This is a population-level association, not an individual
                prescription or proof of causality.
              </p>
            </div>

            <div className="limit-notes reveal">
              <article>
                <span>01</span>
                <h3>Self-reported once</h3>
                <p>
                  Sleep duration included naps and may be affected by recall or
                  misclassification.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Duration, not quality</h3>
                <p>
                  Fragmentation, circadian misalignment and objective sleep
                  architecture were not directly measured.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Direction remains open</h3>
                <p>
                  Residual confounding and reverse causality — especially for
                  long sleep — cannot be fully excluded.
                </p>
              </article>
              <article>
                <span>04</span>
                <h3>Population limits</h3>
                <p>
                  Participants were predominantly of European ancestry; the
                  MRI subset was also selectively healthier.
                </p>
              </article>
            </div>

            <div className="clinical-note reveal">
              <span aria-hidden="true">NOT A CALCULATOR</span>
              <p>
                This visualization does not estimate your biological age,
                diagnose a sleep disorder, or provide individual medical
                advice.
              </p>
            </div>
          </div>
        </section>

        <section className="evidence-section" aria-labelledby="evidence-title">
          <div className="section-shell">
            <div className="evidence-heading reveal">
              <p className="kicker">Open the evidence</p>
              <h2 id="evidence-title">
                Go past
                <br />
                the curve.
              </h2>
              <p>
                Read the peer-reviewed paper, explore the official interactive
                portal, or inspect the analysis code and source figures.
              </p>
            </div>

            <div className="evidence-links reveal">
              <a href={NATURE_URL} target="_blank" rel="noreferrer">
                <span>01</span>
                <strong>Read in Nature</strong>
                <ExternalArrow />
              </a>
              <a href={PORTAL_URL} target="_blank" rel="noreferrer">
                <span>02</span>
                <strong>Explore SleepChart</strong>
                <ExternalArrow />
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                <span>03</span>
                <strong>View code</strong>
                <ExternalArrow />
              </a>
              <a href={ZENODO_URL} target="_blank" rel="noreferrer">
                <span>04</span>
                <strong>Figures on Zenodo</strong>
                <ExternalArrow />
              </a>
              <a href={SOURCE_DATA_URL} target="_blank" rel="noreferrer">
                <span>05</span>
                <strong>Download source data</strong>
                <ExternalArrow />
              </a>
            </div>

            <div className="citation-block reveal">
              <div>
                <span className="plate-label">CITE THIS PAPER</span>
                <p id="paper-citation">{CITATION}</p>
              </div>
              <button type="button" onClick={copyCitation} aria-describedby="paper-citation">
                Copy citation
              </button>
              <p className="copy-status" role="status" aria-live="polite">
                {copyStatus}
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <p>
          The MULTI Consortium et al. <span>·</span> Nature <span>·</span>{" "}
          2026
        </p>
        <p>
          Original explanatory graphics based on the published paper and
          official source data.
        </p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
