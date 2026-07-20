export type SleepStateKey = "short" | "reference" | "long";
export type StudyStratum = "female" | "male";
export type ModalityKey = "proteomic" | "metabolomic" | "mri";

export interface StudySummary {
  sleepReports: number;
  totalClocks: number;
  significantClocks: number;
  organs: number;
  dataLayers: number;
  geneticEndpoints: number;
  geneticAssociations: number;
  clinicalEndpoints: number;
  clinicalAssociations: number;
}

export interface Modality {
  label: string;
  shortLabel: string;
  colour: string;
  dash: readonly number[];
}

export interface AgeingClock {
  id: string;
  organ: string;
  name: string;
  modality: ModalityKey;
  female: number;
  male: number;
  curve: number;
}

export interface SleepState {
  key: SleepStateKey;
  label: string;
  category: string;
  description: string;
  colour: string;
}

export const STUDY: Readonly<StudySummary>;
export const MODALITY_COUNTS: Readonly<Record<ModalityKey, number>>;
export const MODALITIES: Readonly<Record<ModalityKey, Readonly<Modality>>>;
export const CLOCKS: readonly Readonly<AgeingClock>[];

export function getSleepState(hours: number): Readonly<SleepState>;
export function getStudyMinimum(
  clockOrId: AgeingClock | string,
  stratum: StudyStratum,
): number;
export function getStratumRange(
  stratum: StudyStratum,
): { min: number; max: number };
export function getSchematicHeight(
  hours: number,
  clock: AgeingClock,
  stratum: StudyStratum,
): number;
