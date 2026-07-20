import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://sleep-chart.test/", {
      headers: {
        accept: "text/html",
        host: "sleep-chart.test",
        "x-forwarded-host": "sleep-chart.test",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete research story", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Sleep has a shape — Sleep Chart<\/title>/i);
  assert.match(html, /Sleep has a shape\./);
  assert.match(html, /494,951/);
  assert.match(html, /9 of 23/);
  assert.match(
    html,
    /Among 23 biological ageing clocks studied, nine showed significant nonlinear associations/,
  );
  assert.match(html, /Association is not prescription/);
  assert.match(html, /One sleep question\. Three biological layers\./);
  assert.match(html, /Short \+ long · combined study totals/i);
});

test("renders accessible controls, boundaries, and primary evidence links", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /type="range"/);
  assert.match(html, /min="4"/);
  assert.match(html, /max="10"/);
  assert.match(html, /step="0\.1"/);
  assert.match(html, /Female study stratum/);
  assert.match(html, /population-level association/i);
  assert.match(html, /nature\.com\/articles\/s41586-026-10524-5/);
  assert.match(html, /labs-laboratory\.com\/sleepchart/);
  assert.match(html, /github\.com\/anbai106\/SleepChart/);
});

test("contains final metadata and no disposable starter markers", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /property="og:image"/);
  assert.match(html, /https:\/\/sleep-chart\.test\/og\.png/);
  assert.doesNotMatch(
    html,
    /codex-preview|react-loading-skeleton|Your site is taking shape/i,
  );
});
