export type AppType = "Word" | "Excel" | "PowerPoint";

export interface TargetZone {
  top: number; // パーセンテージ (0-100)
  left: number; // パーセンテージ (0-100)
  width: number; // パーセンテージ (0-100)
  height: number; // パーセンテージ (0-100)
}

export interface ImageMarker {
  top: number;    // パーセンテージ (0-100)
  left: number;   // パーセンテージ (0-100)
  size?: number;  // マーカーサイズ（px）、デフォルト30
}

export interface ExplanationImage {
  path: string;
  label: string;
  markers?: ImageMarker[];  // 強調表示するマーカーの位置
}

export interface Question {
  id: number;
  appType: AppType;
  questionText: string;
  imagePath: string;
  targetZone: TargetZone;
  description?: string;
  explanationImagePath?: string;
  explanationImages?: ExplanationImage[];
  explanationText?: string;
  tabName?: string;
}
