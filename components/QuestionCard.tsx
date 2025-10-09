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
  };
  currentQuestion: number;
  totalQuestions: number;
  selectedValue: string | null;
  onAnswer: (value: string) => void;
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
        <div className="max-w-lg mx-auto px-6">
          <h1 className="text-white text-xl font-bold text-center tracking-wide">
            BrightNest
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <ProgressBar 
            current={currentQuestion} 
            total={totalQuestions} 
            onBack={onBack}
            canGoBack={canGoBack}
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-12 leading-relaxed">
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
        </div>
      </div>
    </div>
  );
}