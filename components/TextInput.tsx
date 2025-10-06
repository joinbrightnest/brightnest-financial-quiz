interface TextInputProps {
  question: {
    prompt: string;
    type: string;
  };
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

export default function TextInput({ 
  question, 
  value, 
  onChange, 
  onNext, 
  onBack, 
  canGoBack = false, 
  currentQuestion, 
  totalQuestions 
}: TextInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-gray-900 mb-4 tracking-wide">
            FINANCIAL PROFILE
          </h1>
          {currentQuestion && totalQuestions && (
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
                {Array.from({ length: totalQuestions }, (_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 transform rotate-45 transition-all duration-300 ${
                      index < currentQuestion
                        ? "bg-teal-600"
                        : "border-2 border-teal-600 bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-12 leading-relaxed">
            {question.prompt}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type={question.type === "email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.type === "email" ? "Enter your email address" : "Enter your name"}
              className="w-full p-5 border border-amber-100 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900 text-lg bg-amber-50"
              required
            />
            
            <button
              type="submit"
              disabled={!value.trim()}
              className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors ${
                value.trim()
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
