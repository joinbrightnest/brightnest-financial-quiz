interface ProgressBarProps {
  current: number;
  total: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function ProgressBar({ current, total, onBack, canGoBack = false }: ProgressBarProps) {
  return (
    <div className="mb-4">
      {canGoBack && onBack ? (
        // Layout with back arrow - centered progress bar
        <div className="relative">
          {/* Back Arrow - positioned absolutely */}
          <button
            onClick={onBack}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 text-teal-600 hover:text-teal-700 transition-colors touch-friendly touch-feedback no-select mobile-transition"
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
          
          {/* Centered Progress Bar and Dots */}
          <div className="flex flex-col px-12">
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
        </div>
      ) : (
        // Centered layout for first question - shorter progress bar
        <div className="flex flex-col items-center">
          {/* Progress Bar Container - shorter on mobile */}
          <div className="w-3/4 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(current / total) * 100}%` }}
            />
          </div>
          
          {/* Progress Indicators below the progress bar */}
          <div className="flex justify-between items-center mt-2 w-3/4">
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