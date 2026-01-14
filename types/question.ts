export type AppType = "Word" | "Excel" | "PowerPoint";

export interface TargetZone {
  top: number; // パーセンテージ (0-100)
  left: number; // パーセンテージ (0-100)
  width: number; // パーセンテージ (0-100)
  height: number; // パーセンテージ (0-100)
}

export interface Question {
  id: number;
  appType: AppType;
  questionText: string;
  imagePath: string;
  targetZone: TargetZone;
  description?: string;
  explanationImagePath?: string;
  explanationText?: string;
  tabName?: string;
}
