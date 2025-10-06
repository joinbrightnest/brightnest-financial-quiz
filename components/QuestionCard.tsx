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
  onNext: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function QuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  selectedValue,
  onAnswer,
  onNext,
  onBack,
  canGoBack = false,
}: QuestionCardProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-gray-900 mb-4 tracking-wide">
            FINANCIAL PROFILE
          </h1>
          <ProgressBar 
            current={currentQuestion} 
            total={totalQuestions} 
            onBack={onBack}
            canGoBack={canGoBack}
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-12 leading-relaxed">
            {question.prompt}
          </h2>
          
          <div className="space-y-4">
            {question.options.map((option) => (
              <OptionButton
                key={option.value}
                option={option}
                isSelected={selectedValue === option.value}
                onClick={() => {
                  onAnswer(option.value);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
