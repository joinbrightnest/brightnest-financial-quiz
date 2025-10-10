import OptionButton from "./OptionButton";
import ProgressBar from "./ProgressBar";

interface QuestionCardProps {
  question: {
    id: string;
    prompt: string;
    type: string;
    options: Array<{
      label: string;
      value: string;
      weightCategory: string;
      weightValue: number;
    }>;
    skipButton?: boolean;
    continueButton?: boolean;
    continueButtonColor?: string;
  };
  currentQuestion: number;
  totalQuestions: number;
  selectedValue: string | null;
  onAnswer: (value: string) => void;
  onSkip?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  userVariables?: {
    name?: string;
    email?: string;
  };
}

export default function QuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  selectedValue,
  onAnswer,
  onSkip,
  onContinue,
  onBack,
  canGoBack = false,
  userVariables = {},
}: QuestionCardProps) {
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
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-8">
          <ProgressBar 
            current={currentQuestion} 
            total={totalQuestions} 
            onBack={onBack}
            canGoBack={canGoBack}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-12 leading-relaxed text-left">
            {replaceVariables(question.prompt)}
          </h2>
          
          <div className="space-y-4">
            {question.options.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                isSelected={selectedValue === option.value}
                onClick={() => onAnswer(option.value)}
              />
            ))}
          </div>

          {/* Skip Option */}
          {question.skipButton && (
            <div className="mt-6 text-center">
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
              >
                Skip
              </button>
            </div>
          )}

          {/* Continue Button */}
          {question.continueButton && (
            <div className="mt-6">
              <button
                onClick={selectedValue ? onContinue : undefined}
                disabled={!selectedValue}
                className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-150 ${
                  selectedValue 
                    ? "text-white hover:opacity-90" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={{ 
                  backgroundColor: selectedValue 
                    ? (question.continueButtonColor || "#09727c") 
                    : undefined 
                }}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}