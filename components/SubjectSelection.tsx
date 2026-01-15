"use client";

import { AppType } from "@/types/question";

interface SubjectSelectionProps {
  onSelect: (appType: AppType) => void;
}

export default function SubjectSelection({ onSelect }: SubjectSelectionProps) {
  const subjects = [
    {
      type: "Word" as AppType,
      name: "Word",
      color: "bg-blue-500 hover:bg-blue-600",
      icon: "W",
      description: "文書作成アプリ",
    },
    {
      type: "Excel" as AppType,
      name: "Excel",
      color: "bg-green-500 hover:bg-green-600",
      icon: "X",
      description: "表計算アプリ",
    },
    {
      type: "PowerPoint" as AppType,
      name: "PowerPoint",
      color: "bg-orange-500 hover:bg-orange-600",
      icon: "P",
      description: "プレゼンテーションアプリ",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Office UI マスター
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            学習したいアプリケーションを選択してください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button
              key={subject.type}
              onClick={() => onSelect(subject.type)}
              className={`${subject.color} text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="text-6xl font-bold mb-4">{subject.icon}</div>
              <div className="text-2xl font-semibold mb-2">{subject.name}</div>
              <div className="text-sm opacity-90">{subject.description}</div>
            </button>
          ))}
        </div>

        <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
          <p>タブ探しゲームとボタン探しゲームで Office の UI を学習できます</p>
        </div>
      </div>
    </div>
  );
}
