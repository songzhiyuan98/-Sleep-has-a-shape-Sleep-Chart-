import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the phone hero collapses to one column without horizontal grid gaps", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");
  const mobileStart = css.indexOf("@media (max-width: 620px)");
  const mobileEnd = css.indexOf("@media (prefers-contrast: more)", mobileStart);

  assert.notEqual(mobileStart, -1);
  assert.notEqual(mobileEnd, -1);

  const mobileCss = css.slice(mobileStart, mobileEnd);
  assert.match(
    mobileCss,
    /\.hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s,
  );
  assert.match(mobileCss, /\.hero\s*\{[^}]*column-gap:\s*0;/s);
});

test("the full test command includes strict TypeScript validation", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", root), "utf8"),
  );

  assert.equal(
    packageJson.scripts.typecheck,
    "tsc --noEmit --incremental false",
  );
  assert.match(packageJson.scripts.test, /npm run typecheck/);
});
