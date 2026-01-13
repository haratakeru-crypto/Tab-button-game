"use client";

import { useState, useRef, useEffect } from "react";
import { Question } from "@/types/question";
import { isClickInTargetZone } from "@/lib/utils";

interface GameAreaProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  debugMode?: boolean;
}

// 蝠城｡後ユ繧ｭ繧ｹ繝医°繧峨ち繝門錐繧呈歓蜃ｺ縺吶ｋ髢｢謨ｰ
const extractTabName = (questionText: string): string => {
  // 縲後懊ち繝悶ｒ謗｢縺励※縺上□縺輔＞縲阪°繧峨ち繝門錐繧呈歓蜃ｺ
  const match = questionText.match(/^(.+?)繧ｿ繝悶ｒ謗｢縺励※縺上□縺輔＞/);
  if (match) {
    return match[1];
  }
  // 縲後懊ち繝悶ｒ謗｢縺励※縺上□縺輔＞縲堺ｻ･螟悶・繝代ち繝ｼ繝ｳ縺ｫ繧ょｯｾ蠢・  const match2 = questionText.match(/^(.+?)繧ｿ繝・);
  if (match2) {
    return match2[1];
  }
  return "";
};

// 繧ｿ繝門錐縺ｮ譁・ｭ玲焚縺ｫ蝓ｺ縺･縺・※蟷・ｒ險育ｮ励☆繧矩未謨ｰ
const calculateWidthFromTabName = (tabName: string): number => {
  const charCount = tabName.length;
  // 譁・ｭ玲焚縺ｫ蝓ｺ縺･縺・※蟷・ｒ謗ｨ螳夲ｼ域律譛ｬ隱・譁・ｭ励≠縺溘ｊ邏・.2-1.5%・・  // 譛蟆・%縲∵怙螟ｧ9%
  if (charCount <= 2) {
    return 4; // 繝帙・繝縲∵諺蜈･縺ｪ縺ｩ
  } else if (charCount === 3) {
    return 5; // 繝・じ繧､繝ｳ縺ｪ縺ｩ
  } else if (charCount === 4) {
    return 6; // 繝ｬ繧､繧｢繧ｦ繝医↑縺ｩ
  } else if (charCount === 5) {
    return 7; // 蜿り・ｳ・侭縺ｪ縺ｩ
  } else {
    return Math.min(8, 3 + charCount * 0.8); // 6譁・ｭ嶺ｻ･荳・  }
};

export default function GameArea({ question, onAnswer, debugMode = false }: GameAreaProps) {
  const [showTargetZone, setShowTargetZone] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [debugTargetZone, setDebugTargetZone] = useState<{top: number, left: number, width: number, height: number} | null>(null);
  const [debugClickCoord, setDebugClickCoord] = useState<{x: number, y: number} | null>(null);
  const [manualWidth, setManualWidth] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 蝠城｡後′蛻・ｊ譖ｿ繧上▲縺滓凾縺ｫ繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ繧偵Μ繧ｻ繝・ヨ
    setShowTargetZone(false);
    setDebugTargetZone(null);
    setDebugClickCoord(null);
    setManualWidth(null);
    
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
    
    // 繝・ヰ繝・げ繝｢繝ｼ繝我ｻ･螟悶〒縺ｯ縲∵里縺ｫ隗｣遲疲ｸ医∩縺ｮ蝣ｴ蜷医・蜃ｦ逅・＠縺ｪ縺・    if (!debugMode && showTargetZone) return;

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 逕ｻ蜒上し繧､繧ｺ縺・縺ｮ蝣ｴ蜷医・蠎ｧ讓呵ｨ育ｮ励ｒ繧ｹ繧ｭ繝・・
    if (imageSize.width === 0 || imageSize.height === 0) {
      if (debugMode) {
        console.log("逕ｻ蜒上し繧､繧ｺ縺後∪縺隱ｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ");
      }
      return;
    }

    const percentX = (clickX / imageSize.width) * 100;
    const percentY = (clickY / imageSize.height) * 100;

    const isCorrect = isClickInTargetZone(
      clickX,
      clickY,
      question.targetZone,
      imageSize.width,
      imageSize.height
    );

    if (debugMode) {
      // 蝠城｡後ユ繧ｭ繧ｹ繝医°繧峨ち繝門錐繧呈歓蜃ｺ
      const tabName = extractTabName(question.questionText);
      
      // 手動で設定した幅がある場合はそれを使用、それ以外はタブ名から計算した幅を使用
      const calculatedWidth = manualWidth !== null 
        ? manualWidth 
        : tabName ? calculateWidthFromTabName(tabName) : 6;
      
      const defaultHeight = 4;
      const debugZone = {
        top: Math.max(0, percentY - defaultHeight / 2),
        left: Math.max(0, percentX - calculatedWidth / 2),
        width: calculatedWidth,
        height: defaultHeight,
      };
      
      setDebugTargetZone(debugZone);
      setDebugClickCoord({ x: percentX, y: percentY });
      
      // JSON蠖｢蠑上〒蠎ｧ讓吶ｒ蜃ｺ蜉幢ｼ・uestions.json縺ｫ逶ｴ謗･雋ｼ繧贋ｻ倥￠蜿ｯ閭ｽ・・      const targetZoneJson = JSON.stringify(debugZone, null, 2);
      console.log(`繧ｯ繝ｪ繝・け蠎ｧ讓・ x=${percentX.toFixed(2)}%, y=${percentY.toFixed(2)}%`);
      if (tabName) {
        console.log(`讀懷・縺輔ｌ縺溘ち繝門錐: ${tabName} (${tabName.length}譁・ｭ・`);
        console.log(`險育ｮ励＆繧後◆蟷・ ${calculatedWidth}%`);
      }
      console.log(`繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ・・SON蠖｢蠑擾ｼ・`);
      console.log(targetZoneJson);
      console.log(`questions.json縺ｫ雋ｼ繧贋ｻ倥￠繧句ｽ｢蠑・`);
      console.log(`"targetZone": ${targetZoneJson}`);
      
      return; // 繝・ヰ繝・げ繝｢繝ｼ繝峨〒縺ｯ騾壼ｸｸ縺ｮ繧ｲ繝ｼ繝繝輔Ο繝ｼ繧貞ｮ溯｡後＠縺ｪ縺・    }

    // 豁｣隗｣縺ｧ繧ゆｸ肴ｭ｣隗｣縺ｧ繧ゅ√け繝ｪ繝・け蠕後・蟶ｸ縺ｫ繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ繧定｡ｨ遉ｺ
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
  } : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("繧ｯ繝ｪ繝・・繝懊・繝峨↓繧ｳ繝斐・縺励∪縺励◆・・);
    } catch (err) {
      console.error("繧ｳ繝斐・縺ｫ螟ｱ謨励＠縺ｾ縺励◆:", err);
    }
  };

  const updateDebugZoneWidth = (newWidth: number) => {
    if (debugTargetZone && debugClickCoord) {
      setManualWidth(newWidth);
      const updatedZone = {
        ...debugTargetZone,
        width: newWidth,
        left: Math.max(0, debugClickCoord.x - newWidth / 2),
      };
      setDebugTargetZone(updatedZone);
    }
  };

  const tabName = extractTabName(question.questionText);
  const autoWidth = tabName ? calculateWidthFromTabName(tabName) : 6;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">蝠城｡・{question.id}</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">{question.questionText}</p>
        {question.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{question.description}</p>
        )}
      </div>

      <div className="relative w-full" onClick={handleImageClick}>
        <div className="relative w-full" style={{ position: "relative" }}>
          <img
            ref={imageRef}
            src={question.imagePath}
            alt="Word逕ｻ髱｢"
            className="max-w-full h-auto cursor-crosshair select-none"
            draggable={false}
            onLoad={() => {
              // 逕ｻ蜒剰ｪｭ縺ｿ霎ｼ縺ｿ螳御ｺ・凾縺ｫ繧ｵ繧､繧ｺ繧呈峩譁ｰ
              if (imageRef.current) {
                setImageSize({
                  width: imageRef.current.offsetWidth,
                  height: imageRef.current.offsetHeight,
                });
              }
            }}
          />
          {/* 騾壼ｸｸ縺ｮ繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ */}
          {showTargetZone && !debugMode && (
            <div
              className="absolute target-zone-animation"
              style={targetZoneStyle}
            />
          )}
          {/* 繝・ヰ繝・げ繝｢繝ｼ繝峨・繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ */}
          {debugMode && debugTargetZoneStyle && (
            <div
              className="absolute target-zone-animation"
              style={debugTargetZoneStyle}
            />
          )}
        </div>
        {debugMode && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <div className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
              繝・ヰ繝・げ繝｢繝ｼ繝・ 繧ｯ繝ｪ繝・け蠎ｧ讓吶→繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ縺瑚｡ｨ遉ｺ縺輔ｌ縺ｾ縺・            </div>
            {tabName && (
              <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                讀懷・縺輔ｌ縺溘ち繝門錐: <strong>{tabName}</strong> ({tabName.length}譁・ｭ・ - 閾ｪ蜍戊ｨ育ｮ怜ｹ・ {autoWidth.toFixed(1)}%
              </div>
            )}
            {debugClickCoord && debugTargetZone && (
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <strong>繧ｯ繝ｪ繝・け蠎ｧ讓・</strong> x={debugClickCoord.x.toFixed(2)}%, y={debugClickCoord.y.toFixed(2)}%
                </div>
                <div>
                  <strong>繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ縺ｮ蟷・ｒ隱ｿ謨ｴ:</strong>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="3"
                      max="10"
                      step="0.1"
                      value={debugTargetZone.width}
                      onChange={(e) => updateDebugZoneWidth(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="3"
                      max="10"
                      step="0.1"
                      value={debugTargetZone.width.toFixed(1)}
                      onChange={(e) => updateDebugZoneWidth(parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 border rounded text-xs"
                    />
                    <span className="text-xs">%</span>
                  </div>
                </div>
                <div>
                  <strong>繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ:</strong>
                  <pre className="mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugTargetZone, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(debugTargetZone, null, 2))}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                  >
                    繧ｿ繝ｼ繧ｲ繝・ヨ繧ｾ繝ｼ繝ｳ繧偵さ繝斐・
                  </button>
                  <button
                    onClick={() => copyToClipboard(`"targetZone": ${JSON.stringify(debugTargetZone, null, 2)}`)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                  >
                    JSON蠖｢蠑上〒繧ｳ繝斐・
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
