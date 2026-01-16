"use client";

import { useState, useEffect } from "react";

interface ImageMarker {
  top: number;
  left: number;
  size?: number;
}

interface ExplanationImage {
  path: string;
  label: string;
  markers?: ImageMarker[];
}

interface FeedbackAreaProps {
  isCorrect: boolean | null;
  onNext: () => void;
  showNext: boolean;
  isLastQuestion?: boolean;
  questionId?: number;
  explanationImagePath?: string;
  explanationImages?: ExplanationImage[];
  explanationText?: string;
  debugMode?: boolean;
  mode?: "tab" | "button";
  onExplanationSaved?: (questionId: number, text: string) => void;
}

export default function FeedbackArea({
  isCorrect,
  onNext,
  showNext,
  isLastQuestion = false,
  questionId,
  explanationImagePath,
  explanationImages,
  explanationText,
  debugMode = false,
  mode = "tab",
  onExplanationSaved,
}: FeedbackAreaProps) {
  // Hooksは常にトップレベルで呼ぶ必要がある（早期リターンの前）
  const canEditExplanation = debugMode && mode === "button" && questionId !== undefined;
  const [draftExplanation, setDraftExplanation] = useState(explanationText ?? "");

  // explanationTextが変更された時にdraftExplanationを更新
  useEffect(() => {
    setDraftExplanation(explanationText ?? "");
  }, [explanationText]);

  // 早期リターンはHooksの後で行う
  if (isCorrect === null) {
    return null;
  }

  const handleSaveExplanation = async (newText: string) => {
    if (!canEditExplanation || questionId === undefined) return;
    try {
      await fetch("/api/button-questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          explanationText: newText,
        }),
      });
      if (onExplanationSaved) {
        onExplanationSaved(questionId, newText);
      }
    } catch (err) {
      console.error("Failed to save explanation:", err);
    }
  };

  const ExplanationImage = () => {
    // 複数画像がある場合
    if (explanationImages && explanationImages.length > 0) {
      return (
        <div>
          <div className="flex gap-4 flex-wrap justify-center">
            {explanationImages.map((img, index) => (
              <div key={index} className="flex flex-col items-center">
                <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{img.label}</p>
                <div className="relative">
                  <img
                    src={img.path}
                    alt={img.label}
                    className="max-w-[250px] h-auto rounded border border-gray-200 dark:border-gray-700"
                  />
                  {/* マーカー表示 */}
                  {img.markers && img.markers.map((marker, mIndex) => (
                    <div
                      key={mIndex}
                      className="absolute pointer-events-none"
                      style={{
                        top: `${marker.top}%`,
                        left: `${marker.left}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div 
                        className="animate-pulse"
                        style={{
                          width: `${marker.size || 40}px`,
                          height: `${marker.size || 40}px`,
                          border: '3px solid #ef4444',
                          backgroundColor: 'transparent',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // 単一画像の場合
    return explanationImagePath ? (
      <div>
        <img
          src={explanationImagePath}
          alt="解説画像"
          className="max-w-[250px] h-auto rounded border border-gray-200 dark:border-gray-700"
        />
      </div>
    ) : null;
  };

  const ExplanationText = () => {
    if (!canEditExplanation) {
      return explanationText ? (
        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">{explanationText}</p>
      ) : null;
    }

    return (
      <div>
        <textarea
          value={draftExplanation}
          onChange={(e) => setDraftExplanation(e.target.value)}
          className="w-full min-h-[120px] p-3 border rounded-lg text-sm dark:bg-gray-800 dark:text-white"
          placeholder="解説文を入力してください"
        />
        <button
          onClick={() => handleSaveExplanation(draftExplanation)}
          className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded"
        >
          解説を保存
        </button>
      </div>
    );
  };

  // 解説がない場合は何も表示しない
  const hasExplanation = explanationImagePath || (explanationImages && explanationImages.length > 0) || explanationText || canEditExplanation;
  
  if (!hasExplanation) {
    return null;
  }

  return (
    <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">解説</h4>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <ExplanationText />
        </div>
        <div className="flex-shrink-0">
          <ExplanationImage />
        </div>
      </div>
    </div>
  );
}
