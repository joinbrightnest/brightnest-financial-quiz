interface ProgressBarProps {
  current: number;
  total: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function ProgressBar({ current, total, onBack, canGoBack = false }: ProgressBarProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar Container */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      
      {/* Back Arrow and Progress Indicators */}
      <div className="flex items-center justify-between mt-2">
        {/* Back Arrow */}
        {canGoBack && onBack ? (
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
        ) : (
          <div className="w-8 h-8"></div> // Spacer to maintain alignment
        )}
        
        {/* Progress Indicators */}
        <div className="flex justify-between items-center flex-1 mx-4">
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
        
        {/* Right spacer for symmetry */}
        <div className="w-8 h-8"></div>
      </div>
    </div>
  );
}