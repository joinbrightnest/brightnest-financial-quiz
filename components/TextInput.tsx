import ProgressBar from "./ProgressBar";

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
          {currentQuestion && totalQuestions && (
            <ProgressBar 
              current={currentQuestion} 
              total={totalQuestions} 
              onBack={onBack}
              canGoBack={canGoBack}
            />
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
