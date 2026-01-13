import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 画像上のクリック座標をパーセンテージに変換
 */
export function convertToPercentage(
  clickX: number,
  clickY: number,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number } {
  return {
    x: (clickX / imageWidth) * 100,
    y: (clickY / imageHeight) * 100,
  };
}

/**
 * クリック座標がターゲットゾーン内にあるか判定
 */
export function isClickInTargetZone(
  clickX: number,
  clickY: number,
  targetZone: { top: number; left: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
): boolean {
  const clickPercent = convertToPercentage(clickX, clickY, imageWidth, imageHeight);
  
  return (
    clickPercent.x >= targetZone.left &&
    clickPercent.x <= targetZone.left + targetZone.width &&
    clickPercent.y >= targetZone.top &&
    clickPercent.y <= targetZone.top + targetZone.height
  );
}
