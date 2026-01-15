"use client";

import { useState, useEffect } from "react";

interface FeedbackAreaProps {
  isCorrect: boolean | null;
  onNext: () => void;
  showNext: boolean;
  questionId?: number;
  explanationImagePath?: string;
  explanationText?: string;
  debugMode?: boolean;
  mode?: "tab" | "button";
  onExplanationSaved?: (questionId: number, text: string) => void;
}

export default function FeedbackArea({
  isCorrect,
  onNext,
  showNext,
  questionId,
  explanationImagePath,
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

  const ExplanationImage = () =>
    explanationImagePath ? (
      <div className="mt-4">
        <img
          src={explanationImagePath}
          alt="解説画像"
          className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-700"
        />
      </div>
    ) : null;

  const ExplanationText = () => {
    if (!canEditExplanation) {
      return explanationText ? (
        <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-200">{explanationText}</p>
      ) : null;
    }

    return (
      <div className="mt-3">
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

  return (
    <div className="mt-8">
      <div
        className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${
          isCorrect
            ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500"
            : "bg-red-50 dark:bg-red-900/20 border-2 border-red-500"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          {isCorrect ? (
            <>
              <span className="text-3xl">✓</span>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                正解です！
              </h3>
            </>
          ) : (
            <>
              <span className="text-3xl">✗</span>
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">
                不正解です
              </h3>
            </>
          )}
        </div>

        {(explanationImagePath || explanationText || canEditExplanation) && (
          <div className="mt-4 text-left bg-white/70 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">解説</h4>
            <ExplanationImage />
            <ExplanationText />
          </div>
        )}

        {showNext && (
          <button
            onClick={onNext}
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            次へ
          </button>
        )}
      </div>
    </div>
  );
}
