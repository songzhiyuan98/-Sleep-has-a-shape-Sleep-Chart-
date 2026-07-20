export const STUDY = Object.freeze({
  sleepReports: 494_951,
  totalClocks: 23,
  significantClocks: 9,
  organs: 17,
  dataLayers: 3,
  geneticEndpoints: 527,
  geneticAssociations: 153,
  clinicalEndpoints: 726,
  clinicalAssociations: 153,
});

export const MODALITY_COUNTS = Object.freeze({
  proteomic: 11,
  metabolomic: 5,
  mri: 7,
});

export const MODALITIES = Object.freeze({
  proteomic: Object.freeze({
    label: "Plasma proteomics",
    shortLabel: "PROT",
    colour: "#c8b4ca",
    dash: [],
  }),
  metabolomic: Object.freeze({
    label: "Plasma metabolomics",
    shortLabel: "MET",
    colour: "#d6c87b",
    dash: [2, 7],
  }),
  mri: Object.freeze({
    label: "In vivo MRI",
    shortLabel: "MRI",
    colour: "#e17c5c",
    dash: [10, 7],
  }),
});

export const CLOCKS = Object.freeze([
  Object.freeze({
    id: "brain-prot",
    organ: "Brain",
    name: "Brain ProtBAG",
    modality: "proteomic",
    female: 7.82,
    male: 7.7,
    curve: 3.607,
  }),
  Object.freeze({
    id: "pulmonary-prot",
    organ: "Pulmonary",
    name: "Pulmonary ProtBAG",
    modality: "proteomic",
    female: 7.64,
    male: 7.03,
    curve: 3.209,
  }),
  Object.freeze({
    id: "hepatic-prot",
    organ: "Hepatic",
    name: "Hepatic ProtBAG",
    modality: "proteomic",
    female: 7.52,
    male: 7.7,
    curve: 3.129,
  }),
  Object.freeze({
    id: "immune-prot",
    organ: "Immune",
    name: "Immune ProtBAG",
    modality: "proteomic",
    female: 7.76,
    male: 7.58,
    curve: 3.473,
  }),
  Object.freeze({
    id: "skin-prot",
    organ: "Skin",
    name: "Skin ProtBAG",
    modality: "proteomic",
    female: 7.7,
    male: 7.39,
    curve: 3.211,
  }),
  Object.freeze({
    id: "endocrine-met",
    organ: "Endocrine",
    name: "Endocrine MetBAG",
    modality: "metabolomic",
    female: 6.67,
    male: 6.37,
    curve: 1.039,
  }),
  Object.freeze({
    id: "brain-mri",
    organ: "Brain",
    name: "Brain MRIBAG",
    modality: "mri",
    female: 6.48,
    male: 6.42,
    curve: 1.943,
  }),
  Object.freeze({
    id: "adipose-mri",
    organ: "Adipose",
    name: "Adipose MRIBAG",
    modality: "mri",
    female: 6.91,
    male: 6.91,
    curve: 1.934,
  }),
  Object.freeze({
    id: "pancreas-mri",
    organ: "Pancreas",
    name: "Pancreas MRIBAG",
    modality: "mri",
    female: 6.85,
    male: 6.79,
    curve: 1.954,
  }),
]);

const SLEEP_STATES = Object.freeze({
  short: Object.freeze({
    key: "short",
    label: "Short sleep pattern",
    category: "<6 h",
    description:
      "Below the 6–8 h reference category used in downstream analyses.",
    colour: "#A77AA8",
  }),
  reference: Object.freeze({
    key: "reference",
    label: "Study reference range",
    category: "6–8 h",
    description:
      "The reference category used for disease and mortality comparisons.",
    colour: "#C7D66B",
  }),
  long: Object.freeze({
    key: "long",
    label: "Long sleep pattern",
    category: ">8 h",
    description:
      "Above the 6–8 h reference category used in downstream analyses.",
    colour: "#D86D4A",
  }),
});

export function getSleepState(hours) {
  const value = Number.isFinite(hours) ? Math.min(10, Math.max(4, hours)) : 7;
  if (value < 6) return SLEEP_STATES.short;
  if (value > 8) return SLEEP_STATES.long;
  return SLEEP_STATES.reference;
}

export function getStudyMinimum(clockOrId, stratum) {
  const clock =
    typeof clockOrId === "string"
      ? CLOCKS.find((candidate) => candidate.id === clockOrId)
      : clockOrId;

  if (!clock) {
    throw new RangeError(`Unknown ageing clock: ${String(clockOrId)}`);
  }
  if (stratum !== "female" && stratum !== "male") {
    throw new RangeError(`Unknown study stratum: ${String(stratum)}`);
  }

  return clock[stratum];
}

export function getStratumRange(stratum) {
  if (stratum === "female") return { min: 6.5, max: 7.8 };
  if (stratum === "male") return { min: 6.4, max: 7.7 };
  throw new RangeError(`Unknown study stratum: ${String(stratum)}`);
}

export function getSchematicHeight(hours, clock, stratum) {
  const minimum = getStudyMinimum(clock, stratum);
  const distance = Math.abs(hours - minimum) / 3;
  const curvature = 0.72 + Math.min(0.28, clock.curve / 13);
  return Math.min(1, 0.06 + distance * distance * curvature);
}
