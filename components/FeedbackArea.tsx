"use client";

interface FeedbackAreaProps {
  isCorrect: boolean | null;
  onNext: () => void;
  showNext: boolean;
}

export default function FeedbackArea({ isCorrect, onNext, showNext }: FeedbackAreaProps) {
  if (isCorrect === null) {
    return null;
  }

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
