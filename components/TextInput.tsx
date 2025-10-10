import ProgressBar from "./ProgressBar";

interface TextInputProps {
  question: {
    prompt: string;
    type: string;
    skipButton?: boolean;
    continueButton?: boolean;
    continueButtonColor?: string;
    textUnderAnswers?: string;
    textUnderButton?: string;
  };
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
  userVariables?: {
    name?: string;
    email?: string;
  };
}

export default function TextInput({ 
  question, 
  value, 
  onChange, 
  onSubmit, 
  onSkip,
  onContinue,
  onBack, 
  canGoBack = false, 
  currentQuestion, 
  totalQuestions,
  userVariables = {},
}: TextInputProps) {
  // Replace variables in the question prompt
  const replaceVariables = (text: string) => {
    let replacedText = text;
    if (userVariables.name) {
      replacedText = replacedText.replace(/\{\{name\}\}/g, userVariables.name);
    }
    if (userVariables.email) {
      replacedText = replacedText.replace(/\{\{email\}\}/g, userVariables.email);
    }
    return replacedText;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header Bar */}
      <div className="bg-gray-800 w-full py-4">
        <div className="max-w-md mx-auto px-6">
          <h1 className="text-white text-xl font-bold text-center tracking-wide">
            BrightNest
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-6 md:py-8">
        <div className="mb-8">
          {currentQuestion && totalQuestions && (
            <ProgressBar 
              current={currentQuestion} 
              total={totalQuestions} 
              onBack={onBack}
              canGoBack={canGoBack}
            />
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-6 md:mb-8 leading-relaxed text-left">
            {replaceVariables(question.prompt)}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type={question.type === "email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.type === "email" ? "Enter your email address" : "Enter your name"}
              className="w-full p-5 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900 text-lg text-center touch-friendly mobile-transition"
              style={{ backgroundColor: '#f6f4ed' }}
              required
            />
            
            {/* Text Under Input */}
            {question.textUnderAnswers && (
              <div className="text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {question.textUnderAnswers}
                </p>
              </div>
            )}
            
            {question.continueButton ? (
              <button
                type="button"
                onClick={value.trim() ? onContinue : undefined}
                disabled={!value.trim()}
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-150 touch-friendly touch-feedback no-select mobile-transition ${
                  value.trim()
                    ? "text-white hover:opacity-90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={{
                  backgroundColor: value.trim() ? (question.continueButtonColor || '#09727c') : undefined
                }}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={!value.trim()}
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-150 touch-friendly touch-feedback no-select mobile-transition ${
                  !value.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-teal-700"
                }`}
                style={{
                  backgroundColor: !value.trim() ? undefined : '#09727c'
                }}
              >
                Continue
              </button>
            )}
            
            {/* Text Under Button */}
            {question.textUnderButton && (
              <div className="text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  {question.textUnderButton}
                </p>
              </div>
            )}
          </form>

          {/* Skip Option */}
          {question.skipButton && (
            <div className="mt-6 text-center">
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors touch-friendly touch-feedback no-select"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}