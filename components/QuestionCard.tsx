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
}

export default function QuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  selectedValue,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProgressBar current={currentQuestion} total={totalQuestions} />
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {question.prompt}
        </h2>
        
        <div className="space-y-3 mb-8">
          {question.options.map((option) => (
            <OptionButton
              key={option.value}
              option={option}
              isSelected={selectedValue === option.value}
              onClick={() => onAnswer(option.value)}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Question {currentQuestion} of {totalQuestions}
          </span>
          
          <button
            onClick={onNext}
            disabled={!selectedValue}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedValue
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentQuestion === totalQuestions ? "Finish Quiz" : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
