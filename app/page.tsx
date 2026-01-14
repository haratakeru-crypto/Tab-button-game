"use client";

import { useEffect, useMemo, useState } from "react";
import GameArea from "@/components/GameArea";
import FeedbackArea from "@/components/FeedbackArea";
import { Question } from "@/types/question";
import questionsData from "@/data/questions.json";
import buttonQuestionsData from "@/data/button-questions.json";

export default function Home() {
  const [mode, setMode] = useState<"tab" | "button">("tab");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebugMode(params.get("debug") === "true");
    setMode(params.get("mode") === "button" ? "button" : "tab");
  }, []);

  useEffect(() => {
    const dataset = mode === "button" ? (buttonQuestionsData as Question[]) : (questionsData as Question[]);
    setQuestions(dataset.map((q) => ({ ...q })));
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsCorrect(null);
    setGameCompleted(false);
  }, [mode]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const canGoPrevious = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < questions.length - 1;

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore((prev) => ({ ...prev, total: prev.total + 1 }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsCorrect(null);
      setGameCompleted(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsCorrect(null);
      setGameCompleted(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsCorrect(null);
    } else {
      setGameCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsCorrect(null);
    setGameCompleted(false);
  };

  const handleExplanationSaved = (questionId: number, text: string) => {
    if (mode !== "button") return;
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, explanationText: text } : q)));
  };

  const goToButtonMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "button");
    window.location.href = url.toString();
  };

  const goToTabMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("mode");
    window.location.href = url.toString();
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-gray-700 dark:text-gray-200">問題を読み込んでいます...</p>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">ゲーム完了！</h1>
          <div className="mb-8">
            <p className="text-2xl mb-4 text-gray-700 dark:text-gray-300">
              スコア: {score.correct} / {score.total}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              正答率: {((score.correct / score.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              もう一度プレイ
            </button>
            <button
              onClick={goToButtonMode}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              ボタン探しゲームにいく
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Office UI マスター</h1>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                スコア: {score.correct} / {score.total}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                問題 {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
          </div>

          {/* 前の問題、次の問題ボタン */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                canGoPrevious
                  ? "bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              ← 前の問題
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={!canGoNext}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                canGoNext
                  ? "bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              次の問題 →
            </button>
          </div>

          {debugMode && (
            <div className="mb-4 space-y-2">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500 rounded p-2 text-sm text-yellow-800 dark:text-yellow-200">
                デバッグモードが有効です
              </div>
              <div className="flex gap-2 flex-wrap">
                {mode === "tab" ? (
                  <button
                    onClick={goToButtonMode}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    → ボタン探しゲームに移動
                  </button>
                ) : (
                  <button
                    onClick={goToTabMode}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    → タブ探しゲームに移動
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ゲームエリア */}
        <GameArea question={currentQuestion} onAnswer={handleAnswer} debugMode={debugMode} mode={mode} />

        {/* フィードバックエリア */}
        <FeedbackArea
          isCorrect={isCorrect}
          onNext={handleNext}
          showNext={isCorrect !== null}
          questionId={currentQuestion.id}
          explanationImagePath={currentQuestion.explanationImagePath}
          explanationText={currentQuestion.explanationText}
          debugMode={debugMode}
          mode={mode}
          onExplanationSaved={handleExplanationSaved}
        />
      </div>
    </div>
  );
}
