interface ProgressBarProps {
  current: number;
  total: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function ProgressBar({ current, total, onBack, canGoBack = false }: ProgressBarProps) {
  return (
    <div className="flex justify-center items-center space-x-4 mb-8">
      {/* Back Arrow */}
      {canGoBack && onBack && (
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 text-teal-600 hover:text-teal-700 transition-colors"
          aria-label="Go back to previous question"
        >
          <svg
            className="w-6 h-6 transform rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
      
      {/* Progress Diamonds */}
      <div className="flex items-center space-x-2">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`w-3 h-3 transform rotate-45 transition-all duration-300 ${
              index < current
                ? "bg-teal-600"
                : "border-2 border-teal-600 bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}