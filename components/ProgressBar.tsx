interface ProgressBarProps {
  current: number;
  total: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function ProgressBar({ current, total, onBack, canGoBack = false }: ProgressBarProps) {
  return (
    <div className="mb-8">
      {canGoBack && onBack ? (
        // Layout with back arrow
        <div className="flex items-center gap-3">
          {/* Back Arrow */}
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 text-teal-600 hover:text-teal-700 transition-colors flex-shrink-0"
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
          
          {/* Container for Progress Bar and Dots */}
          <div className="flex-1 flex flex-col">
            {/* Progress Bar Container */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(current / total) * 100}%` }}
              />
            </div>
            
            {/* Progress Indicators below the progress bar only */}
            <div className="flex justify-between items-center mt-2">
              {Array.from({ length: total }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < current
                      ? "bg-teal-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Centered layout for first question
        <div className="flex flex-col">
          {/* Progress Bar Container */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(current / total) * 100}%` }}
            />
          </div>
          
          {/* Progress Indicators below the progress bar */}
          <div className="flex justify-between items-center mt-2">
            {Array.from({ length: total }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < current
                    ? "bg-teal-600"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}