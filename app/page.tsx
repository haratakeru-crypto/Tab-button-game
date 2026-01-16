"use client";

import { useEffect, useMemo, useState } from "react";
import GameArea from "@/components/GameArea";
import FeedbackArea from "@/components/FeedbackArea";
import SubjectSelection from "@/components/SubjectSelection";
import { AppType, Question } from "@/types/question";

// Word用データ（静的インポート）
import wordQuestionsData from "@/data/questions.json";
import wordButtonQuestionsData from "@/data/button-questions.json";

// Excel用データ（静的インポート）
import excelQuestionsData from "@/data/excel-questions.json";
import excelButtonQuestionsData from "@/data/excel-button-questions.json";

// PowerPoint用データ（静的インポート）
import powerpointQuestionsData from "@/data/powerpoint-questions.json";
import powerpointButtonQuestionsData from "@/data/powerpoint-button-questions.json";

export default function Home() {
  const [appType, setAppType] = useState<AppType | null>(null);
  const [mode, setMode] = useState<"tab" | "button">("tab");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<number[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // 全問題を保持（解きなおし用）

  // URLパラメータを読み取る関数
  const readUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    setDebugMode(params.get("debug") === "true");
    setMode(params.get("mode") === "button" ? "button" : "tab");

    const appParam = params.get("app")?.toLowerCase();
    if (appParam === "word") {
      setAppType("Word");
    } else if (appParam === "excel") {
      setAppType("Excel");
    } else if (appParam === "powerpoint") {
      setAppType("PowerPoint");
    } else {
      setAppType(null);
    }
  };

  // 初期読み込みとブラウザの戻る/進むボタン対応
  useEffect(() => {
    readUrlParams();
    setLoading(false);

    // ブラウザの戻る/進むボタンに対応
    const handlePopState = () => {
      readUrlParams();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 科目選択時の処理（ページリロードなしで状態を更新）
  const handleSelectApp = (selectedApp: AppType) => {
    setAppType(selectedApp);
    // URLも更新（ページリロードなし）
    const url = new URL(window.location.href);
    url.searchParams.set("app", selectedApp.toLowerCase());
    window.history.pushState({}, "", url.toString());
  };

  // 問題データを読み込む
  useEffect(() => {
    if (!appType) return;

    const loadQuestions = async () => {
      setLoading(true);
      try {
        let apiEndpoint = "";
        let staticData: Question[] = [];

        // APIエンドポイントと静的データを科目ごとに設定
        if (appType === "Word") {
          apiEndpoint = mode === "button" ? "/api/button-questions" : "/api/questions";
          staticData = mode === "button" 
            ? (wordButtonQuestionsData as Question[])
            : (wordQuestionsData as Question[]);
        } else if (appType === "Excel") {
          apiEndpoint = mode === "button" ? "/api/excel-button-questions" : "/api/excel-questions";
          staticData = mode === "button"
            ? (excelButtonQuestionsData as Question[])
            : (excelQuestionsData as Question[]);
        } else if (appType === "PowerPoint") {
          apiEndpoint = mode === "button" ? "/api/powerpoint-button-questions" : "/api/powerpoint-questions";
          staticData = mode === "button"
            ? (powerpointButtonQuestionsData as Question[])
            : (powerpointQuestionsData as Question[]);
        }

        let loadedQuestions: Question[] = [];
        
        if (mode === "button") {
          // ボタンモードの場合はAPIから最新データを取得
          try {
            const response = await fetch(apiEndpoint);
            if (response.ok) {
              const data = await response.json();
              loadedQuestions = data.questions.map((q: Question) => ({ ...q }));
            } else {
              console.error("APIエラー:", response.statusText);
              loadedQuestions = staticData.map((q) => ({ ...q }));
            }
          } catch {
            loadedQuestions = staticData.map((q) => ({ ...q }));
          }
        } else {
          // タブモードの場合は静的データを使用
          loadedQuestions = staticData.map((q) => ({ ...q }));
        }
        
        setQuestions(loadedQuestions);
        setAllQuestions(loadedQuestions); // 全問題を保持

        setCurrentQuestionIndex(0);
        setScore({ correct: 0, total: 0 });
        setIsCorrect(null);
        setGameCompleted(false);
        setWrongQuestionIds([]);
      } catch (error) {
        console.error("データ読み込みエラー:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [appType, mode]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const canGoPrevious = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < questions.length - 1;

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      // 不正解の場合、問題IDを記録（重複なし）
      setWrongQuestionIds((prev) => {
        if (!prev.includes(currentQuestion.id)) {
          return [...prev, currentQuestion.id];
        }
        return prev;
      });
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
      // 未回答で次の問題に移動した場合は不正解としてカウント
      if (isCorrect === null) {
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
        // 不正解の問題IDを記録（重複なし）
        setWrongQuestionIds((prev) => {
          if (!prev.includes(currentQuestion.id)) {
            return [...prev, currentQuestion.id];
          }
          return prev;
        });
      }
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
    // 全問題に戻す
    setQuestions(allQuestions);
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsCorrect(null);
    setGameCompleted(false);
    setWrongQuestionIds([]);
  };

  const handleRetryWrong = () => {
    // 間違えた問題のみでゲームを再開
    const wrongQuestions = allQuestions.filter((q) => wrongQuestionIds.includes(q.id));
    setQuestions(wrongQuestions);
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsCorrect(null);
    setGameCompleted(false);
    setWrongQuestionIds([]);
  };

  const handleExplanationSaved = (questionId: number, text: string) => {
    if (mode !== "button") return;
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, explanationText: text } : q)));
  };

  const goToButtonMode = () => {
    setMode("button");
    // URLも更新（ページリロードなし）
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "button");
    window.history.pushState({}, "", url.toString());
  };

  const goToTabMode = () => {
    setMode("tab");
    // URLも更新（ページリロードなし）
    const url = new URL(window.location.href);
    url.searchParams.delete("mode");
    window.history.pushState({}, "", url.toString());
  };

  const goToSubjectSelection = () => {
    setAppType(null);
    setMode("tab");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore({ correct: 0, total: 0 });
    setIsCorrect(null);
    setGameCompleted(false);
    // URLも更新（ページリロードなし）
    const url = new URL(window.location.href);
    url.searchParams.delete("app");
    url.searchParams.delete("mode");
    window.history.pushState({}, "", url.toString());
  };

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-gray-700 dark:text-gray-200">読み込み中...</p>
      </div>
    );
  }

  // 科目未選択の場合は科目選択画面を表示
  if (!appType) {
    return <SubjectSelection onSelect={handleSelectApp} />;
  }

  // 問題データ読み込み中
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-gray-700 dark:text-gray-200">問題を読み込んでいます...</p>
      </div>
    );
  }

  // ゲーム完了画面
  if (gameCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">ゲーム完了！</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{appType} - {mode === "button" ? "ボタン探し" : "タブ探し"}</p>
          <div className="mb-8">
            <p className="text-2xl mb-4 text-gray-700 dark:text-gray-300">
              スコア: {score.correct} / {score.total}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              正答率: {((score.correct / score.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {/* メインボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                もう一度プレイ
              </button>
              {wrongQuestionIds.length > 0 && (
                <button
                  onClick={handleRetryWrong}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  間違えた問題を解きなおす（{wrongQuestionIds.length}問）
                </button>
              )}
            </div>
            {/* モード切替ボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {mode === "tab" ? (
                <button
                  onClick={goToButtonMode}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  ボタン探しゲームへ
                </button>
              ) : (
                <button
                  onClick={goToTabMode}
                  className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  タブ探しゲームへ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // アプリごとの色設定
  const appColors = {
    Word: "text-blue-600 dark:text-blue-400",
    Excel: "text-green-600 dark:text-green-400",
    PowerPoint: "text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー - 固定表示 */}
        <header className="mb-8 sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pb-4 -mx-4 px-4 pt-4 -mt-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Office UI マスター</h1>
              <p className={`text-lg font-semibold ${appColors[appType]}`}>
                {appType} - {mode === "button" ? "ボタン探しゲーム" : "タブ探しゲーム"}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
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
              onClick={goToSubjectSelection}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              ← 科目選択
            </button>
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
            {/* 最後の問題で回答済みの場合は「スコア画面へ」ボタンを表示 */}
            {currentQuestionIndex === questions.length - 1 && isCorrect !== null ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg font-semibold transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
              >
                スコア画面へ →
              </button>
            ) : (
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
            )}
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

        {/* 問題文 + 正誤・解説（横並び） */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
          {/* 左側: 問題文（一行） */}
          <div className="flex-shrink-0">
            <p className="text-lg">
              <span className="font-bold">問題 {currentQuestion.id}:</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">{currentQuestion.questionText}</span>
            </p>
          </div>
          {/* 右側: 正誤 + 解説（色付き枠内） */}
          {isCorrect !== null && (
            <div className="flex-1">
              <div
                className={`p-4 rounded-lg shadow-lg ${
                  isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500"
                    : "bg-red-50 dark:bg-red-900/20 border-2 border-red-500"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <span className="text-2xl">✓</span>
                        <span className="text-xl font-bold text-green-700 dark:text-green-400">正解です！</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">✗</span>
                        <span className="text-xl font-bold text-red-700 dark:text-red-400">不正解です</span>
                      </>
                    )}
                  </div>
                  {currentQuestionIndex < questions.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      次へ
                    </button>
                  )}
                </div>
                {/* 解説エリア */}
                <FeedbackArea
                  isCorrect={isCorrect}
                  onNext={handleNext}
                  showNext={isCorrect !== null}
                  isLastQuestion={currentQuestionIndex === questions.length - 1}
                  questionId={currentQuestion.id}
                  explanationImagePath={currentQuestion.explanationImagePath}
                  explanationImages={currentQuestion.explanationImages}
                  explanationText={currentQuestion.explanationText}
                  debugMode={debugMode}
                  mode={mode}
                  onExplanationSaved={handleExplanationSaved}
                />
              </div>
            </div>
          )}
        </div>

        {/* ゲームエリア（画像のみ） */}
        <GameArea question={currentQuestion} onAnswer={handleAnswer} debugMode={debugMode} mode={mode} appType={appType} />
      </div>
    </div>
  );
}
