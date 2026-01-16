"use client";

import { useState, useRef, useEffect } from "react";
import { Question, AppType } from "@/types/question";
import { isClickInTargetZone } from "@/lib/utils";

interface GameAreaProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  debugMode?: boolean;
  mode?: "tab" | "button";
  appType?: AppType;
}

// 問題テキストからタブ名を抽出する関数
const extractTabName = (questionText: string): string => {
  // 「〜タブを探してください」からタブ名を抽出
  const match = questionText.match(/(.+?)タブを探してください/);
  if (match) {
    return match[1];
  }
  // 「〜タブを探してください」以外のパターンにも対応
  const match2 = questionText.match(/(.+?)タブ/);
  if (match2) {
    return match2[1];
  }
  return "";
};

// クリック位置（X座標）からタブ名を推定する関数
const estimateTabNameFromClickPosition = (percentX: number): string => {
  // 一般的なWordのタブの位置を想定（画像によって調整が必要な場合があります）
  if (percentX < 8) {
    return "ホーム"; // 2文字
  } else if (percentX < 18) {
    return "挿入"; // 2文字
  } else if (percentX < 28) {
    return "デザイン"; // 3文字
  } else if (percentX < 38) {
    return "レイアウト"; // 4文字
  } else if (percentX < 48) {
    return "参考資料"; // 5文字
  } else {
    return ""; // 推定できない場合は空文字
  }
};

// タブ名の文字数に基づいて幅を計算する関数
const calculateWidthFromTabName = (tabName: string): number => {
  const charCount = tabName.length;
  // 文字数に基づいて幅を推定（日本語1文字あたり約1.2-1.5%）
  // 最小3%、最大9%
  if (charCount <= 2) {
    return 4; // ホーム、挿入など
  } else if (charCount === 3) {
    return 5; // デザインなど
  } else if (charCount === 4) {
    return 6; // レイアウトなど
  } else if (charCount === 5) {
    return 7; // 参考資料など
  } else {
    return Math.min(8, 3 + charCount * 0.8); // 6文字以上
  }
};

export default function GameArea({ question, onAnswer, debugMode = false, mode = "tab", appType = "Word" }: GameAreaProps) {
  const [showTargetZone, setShowTargetZone] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [debugTargetZone, setDebugTargetZone] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [debugClickCoord, setDebugClickCoord] = useState<{x: number, y: number} | null>(null);
  const [manualWidth, setManualWidth] = useState<number | null>(null);
  const [savedTargetZone, setSavedTargetZone] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [explanationText, setExplanationText] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 問題が切り替わった時にターゲットゾーンをリセット
    setShowTargetZone(false);
    setDebugTargetZone(null);
    setDebugClickCoord(null);
    setManualWidth(null);
    setSavedTargetZone(null);
    setExplanationText(question.explanationText || "");
    
    const updateImageSize = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    };

    updateImageSize();
    window.addEventListener("resize", updateImageSize);
    return () => window.removeEventListener("resize", updateImageSize);
  }, [question]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    // デバッグモード以外では、既に解答済みの場合は処理しない
    if (!debugMode && showTargetZone) return;

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // rectのサイズを直接使用（実際の表示サイズ）
    const actualWidth = rect.width;
    const actualHeight = rect.height;

    // 画像サイズが0の場合は座標計算をスキップ
    if (actualWidth === 0 || actualHeight === 0) {
      if (debugMode) {
        console.log("画像サイズがまだ読み込まれていません");
      }
      return;
    }

    const percentX = (clickX / actualWidth) * 100;
    const percentY = (clickY / actualHeight) * 100;

    const isCorrect = isClickInTargetZone(
      clickX,
      clickY,
      question.targetZone,
      actualWidth,
      actualHeight
    );

    // 通常モードでも判定の詳細をログに出力（デバッグ用）
    console.log("=== クリック判定 ===");
    console.log(`問題ID: ${question.id}`);
    console.log(`クリック座標（パーセント）: x=${percentX.toFixed(2)}%, y=${percentY.toFixed(2)}%`);
    console.log(`ターゲットゾーン:`, question.targetZone);
    console.log(`判定結果: ${isCorrect ? "✅ 正解" : "❌ 不正解"}`);
    
    // ターゲットゾーンの範囲を計算
    const targetLeft = question.targetZone.left;
    const targetRight = question.targetZone.left + question.targetZone.width;
    const targetTop = question.targetZone.top;
    const targetBottom = question.targetZone.top + question.targetZone.height;
    
    console.log(`ターゲットゾーン範囲: x=[${targetLeft.toFixed(2)}%, ${targetRight.toFixed(2)}%], y=[${targetTop.toFixed(2)}%, ${targetBottom.toFixed(2)}%]`);
    console.log(`X範囲チェック: ${percentX.toFixed(2)} >= ${targetLeft.toFixed(2)} && ${percentX.toFixed(2)} <= ${targetRight.toFixed(2)} = ${percentX >= targetLeft && percentX <= targetRight}`);
    console.log(`Y範囲チェック: ${percentY.toFixed(2)} >= ${targetTop.toFixed(2)} && ${percentY.toFixed(2)} <= ${targetBottom.toFixed(2)} = ${percentY >= targetTop && percentY <= targetBottom}`);

    if (debugMode) {
      // 新しいクリック時は、手動設定された幅をリセットして自動計算を使用
      setManualWidth(null);
      
      // クリック位置からタブ名を推定（デバッグモードでは実際のクリック位置を使用）
      const estimatedTabName = estimateTabNameFromClickPosition(percentX);
      // 推定できない場合は問題テキストから抽出
      const tabName = estimatedTabName || extractTabName(question.questionText);
      
      // タブ名から幅を自動計算（新しいクリック時は常に自動計算を使用）
      const calculatedWidth = tabName ? calculateWidthFromTabName(tabName) : 6;
      
      const defaultHeight = 8;
      const debugZone = {
        top: Math.max(0, percentY - defaultHeight / 2),
        left: Math.max(0, percentX - calculatedWidth / 2),
        width: calculatedWidth,
        height: defaultHeight,
      };
      
      setDebugTargetZone(debugZone);
      setDebugClickCoord({ x: percentX, y: percentY });
      
      // JSON形式で座標を出力（questions.jsonに直接貼り付け可能）
      const targetZoneJson = JSON.stringify(debugZone, null, 2);
      console.log(`クリック座標: x=${percentX.toFixed(2)}%, y=${percentY.toFixed(2)}%`);
      if (tabName) {
        console.log(`検出されたタブ名: ${tabName} (${tabName.length}文字)`);
        console.log(`計算された幅: ${calculatedWidth}%`);
      }
      console.log(`ターゲットゾーン（JSON形式）:`);
      console.log(targetZoneJson);
      console.log(`questions.jsonに貼り付ける形式:`);
      console.log(`"targetZone": ${targetZoneJson}`);
      
      return; // デバッグモードでは通常のゲームフローを実行しない
    }

    // 正解でも不正解でも、クリック後は常にターゲットゾーンを表示
    setShowTargetZone(true);
    onAnswer(isCorrect);
  };

  const targetZoneStyle = {
    position: "absolute" as const,
    top: `${question.targetZone.top}%`,
    left: `${question.targetZone.left}%`,
    width: `${question.targetZone.width}%`,
    height: `${question.targetZone.height}%`,
    border: showTargetZone ? "3px solid #ef4444" : "none",
    backgroundColor: showTargetZone ? "rgba(239, 68, 68, 0.1)" : "transparent",
    pointerEvents: "none" as const,
  };

  const debugTargetZoneStyle = debugTargetZone ? {
    position: "absolute" as const,
    top: `${debugTargetZone.top}%`,
    left: `${debugTargetZone.left}%`,
    width: `${debugTargetZone.width}%`,
    height: `${debugTargetZone.height}%`,
    border: "3px solid #3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    pointerEvents: "none" as const,
    zIndex: 10,
  } : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("クリップボードにコピーしました！");
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  const updateDebugZoneWidth = (newWidth: number) => {
    if (debugTargetZone) {
      setManualWidth(newWidth);
      // 幅だけを変更し、leftは変更しない（手動調整時は位置を固定）
      const updatedZone = {
        ...debugTargetZone,
        width: newWidth,
      };
      setDebugTargetZone(updatedZone);
    }
  };

  const updateDebugZoneTop = (newTop: number) => {
    if (debugTargetZone) {
      const updatedZone = {
        ...debugTargetZone,
        top: Math.max(0, Math.min(100, newTop)),
      };
      setDebugTargetZone(updatedZone);
    }
  };

  const updateDebugZoneLeft = (newLeft: number) => {
    if (debugTargetZone) {
      const updatedZone = {
        ...debugTargetZone,
        left: Math.max(0, Math.min(100, newLeft)),
      };
      setDebugTargetZone(updatedZone);
    }
  };

  const updateDebugZoneHeight = (newHeight: number) => {
    if (debugTargetZone) {
      const updatedZone = {
        ...debugTargetZone,
        height: Math.max(1, Math.min(100, newHeight)),
      };
      setDebugTargetZone(updatedZone);
    }
  };

  const showCurrentTargetZone = () => {
    // 保存済みのターゲットゾーンがあればそれを使用、なければ元のデータを使用
    const targetZone = savedTargetZone || question.targetZone;
    setDebugTargetZone({ ...targetZone });
    setDebugClickCoord(null);
    console.log("現在のターゲットゾーンを表示:", targetZone);
  };

  // 科目とモードに応じたAPIエンドポイントを取得
  const getApiEndpoint = () => {
    if (appType === "Excel") {
      return mode === "button" ? "/api/excel-button-questions" : "/api/excel-questions";
    } else if (appType === "PowerPoint") {
      return mode === "button" ? "/api/powerpoint-button-questions" : "/api/powerpoint-questions";
    } else {
      // Word（デフォルト）
      return mode === "button" ? "/api/button-questions" : "/api/questions";
    }
  };

  const saveTargetZone = async () => {
    if (!debugTargetZone) {
      alert("ターゲットゾーンが設定されていません");
      return;
    }

    try {
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.id,
          targetZone: debugTargetZone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedTargetZone({ ...debugTargetZone });
        alert("ターゲットゾーンを保存しました！");
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error || "保存に失敗しました"}`);
      }
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました");
    }
  };

  const saveExplanationText = async () => {
    try {
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.id,
          explanationText: explanationText,
        }),
      });

      if (response.ok) {
        alert("解説テキストを保存しました！");
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error || "保存に失敗しました"}`);
      }
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました");
    }
  };

  const tabName = extractTabName(question.questionText);
  const autoWidth = tabName ? calculateWidthFromTabName(tabName) : 6;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative w-full" onClick={handleImageClick}>
        <div className="relative inline-block" style={{ position: "relative" }}>
          <img
            ref={imageRef}
            src={question.imagePath}
            alt={`${appType}画面`}
            className="block max-w-full h-auto cursor-crosshair select-none"
            draggable={false}
            onLoad={() => {
              // 画像読み込み完了時にサイズを更新
              if (imageRef.current) {
                setImageSize({
                  width: imageRef.current.offsetWidth,
                  height: imageRef.current.offsetHeight,
                });
              }
            }}
          />
          {/* 通常のターゲットゾーン */}
          {showTargetZone && !debugMode && (
            <div
              className="absolute target-zone-animation"
              style={targetZoneStyle}
            />
          )}
          {/* デバッグモードのターゲットゾーン */}
          {debugMode && debugTargetZoneStyle && (
            <div
              className="absolute target-zone-animation"
              style={debugTargetZoneStyle}
            />
          )}
        </div>
        {debugMode && (
          <div 
            className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
              デバッグモード: クリック座標とターゲットゾーンが表示されます
            </div>
            <div className="mb-3">
              <button
                onClick={showCurrentTargetZone}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                現在のターゲットゾーンを表示
              </button>
            </div>
            {tabName && (
              <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                検出されたタブ名: <strong>{tabName}</strong> ({tabName.length}文字) - 自動計算幅: {autoWidth.toFixed(1)}%
              </div>
            )}
            {debugTargetZone && (
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                {debugClickCoord && (
                  <div>
                    <strong>クリック座標:</strong> x={debugClickCoord.x.toFixed(2)}%, y={debugClickCoord.y.toFixed(2)}%
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <strong>位置 (top):</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={debugTargetZone.top.toFixed(1)}
                        onChange={(e) => updateDebugZoneTop(parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                  <div>
                    <strong>位置 (left):</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={debugTargetZone.left.toFixed(1)}
                        onChange={(e) => updateDebugZoneLeft(parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <strong>幅 (width):</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="range"
                        min="1.5"
                        max="30"
                        step="0.1"
                        value={debugTargetZone.width}
                        onChange={(e) => updateDebugZoneWidth(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="1.5"
                        max="30"
                        step="0.1"
                        value={debugTargetZone.width}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateDebugZoneWidth(val);
                          }
                        }}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                  <div>
                    <strong>高さ (height):</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="0.1"
                        value={debugTargetZone.height}
                        onChange={(e) => updateDebugZoneHeight(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="0.1"
                        value={debugTargetZone.height.toFixed(1)}
                        onChange={(e) => updateDebugZoneHeight(parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <strong>ターゲットゾーン:</strong>
                  <pre className="mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugTargetZone, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(debugTargetZone, null, 2))}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                  >
                    ターゲットゾーンをコピー
                  </button>
                  <button
                    onClick={() => copyToClipboard(`"targetZone": ${JSON.stringify(debugTargetZone, null, 2)}`)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                  >
                    JSON形式でコピー
                  </button>
                  <button
                    onClick={saveTargetZone}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-bold"
                  >
                    修正
                  </button>
                </div>
              </div>
            )}
            
            {/* 解説セクション */}
            <div className="mt-4 pt-4 border-t border-yellow-300 dark:border-yellow-700">
              <h4 className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200">解説編集</h4>
              
              {/* 解説画像（複数対応・マーカー付き） */}
              {question.explanationImages && question.explanationImages.length > 0 ? (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">解説画像:</p>
                  <div className="flex gap-4 flex-wrap">
                    {question.explanationImages.map((img: { path: string; label: string; markers?: { top: number; left: number; size?: number }[] }, index: number) => (
                      <div key={index} className="flex flex-col items-center">
                        <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{img.label}</p>
                        <div className="relative">
                          <img
                            src={img.path}
                            alt={img.label}
                            className="max-w-[200px] h-auto rounded border border-gray-300 dark:border-gray-600"
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
                                  width: `${marker.size || 32}px`,
                                  height: `${marker.size || 32}px`,
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
              ) : question.explanationImagePath && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">解説画像:</p>
                  <img
                    src={question.explanationImagePath}
                    alt="解説画像"
                    className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
              
              {/* 解説テキスト入力 */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">解説テキスト:</p>
                <textarea
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  className="w-full min-h-[100px] p-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="解説テキストを入力してください"
                />
              </div>
              
              <button
                onClick={saveExplanationText}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded"
              >
                解説テキストを保存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
