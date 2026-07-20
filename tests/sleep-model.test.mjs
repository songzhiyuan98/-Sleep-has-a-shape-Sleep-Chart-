import assert from "node:assert/strict";
import test from "node:test";

import {
  CLOCKS,
  MODALITY_COUNTS,
  STUDY,
  getSleepState,
  getStratumRange,
  getStudyMinimum,
} from "../app/sleep-model.mjs";

test("maps continuous hours to the paper's analytical categories", () => {
  assert.equal(getSleepState(4).key, "short");
  assert.equal(getSleepState(5.9).key, "short");
  assert.equal(getSleepState(6).key, "reference");
  assert.equal(getSleepState(8).key, "reference");
  assert.equal(getSleepState(8.1).key, "long");
  assert.equal(getSleepState(10).key, "long");
});

test("contains the nine significant clocks and the full modality totals", () => {
  assert.equal(CLOCKS.length, 9);
  assert.deepEqual(MODALITY_COUNTS, {
    proteomic: 11,
    metabolomic: 5,
    mri: 7,
  });
  assert.equal(STUDY.totalClocks, 23);
  assert.equal(STUDY.significantClocks, 9);
  assert.equal(STUDY.sleepReports, 494_951);
});

test("preserves every sex-stratified Nature source-data minimum", () => {
  const expected = {
    "brain-prot": { female: 7.82, male: 7.7 },
    "pulmonary-prot": { female: 7.64, male: 7.03 },
    "hepatic-prot": { female: 7.52, male: 7.7 },
    "immune-prot": { female: 7.76, male: 7.58 },
    "skin-prot": { female: 7.7, male: 7.39 },
    "endocrine-met": { female: 6.67, male: 6.37 },
    "brain-mri": { female: 6.48, male: 6.42 },
    "adipose-mri": { female: 6.91, male: 6.91 },
    "pancreas-mri": { female: 6.85, male: 6.79 },
  };

  for (const [clockId, minima] of Object.entries(expected)) {
    assert.equal(getStudyMinimum(clockId, "female"), minima.female);
    assert.equal(getStudyMinimum(clockId, "male"), minima.male);
  }
});

test("reports the published rounded minima range for each study stratum", () => {
  assert.deepEqual(getStratumRange("female"), { min: 6.5, max: 7.8 });
  assert.deepEqual(getStratumRange("male"), { min: 6.4, max: 7.7 });
});
