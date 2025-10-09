import ProgressBar from "./ProgressBar";

interface TextInputProps {
  question: {
    prompt: string;
    type: string;
  };
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
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
      <div className="max-w-md mx-auto px-6 py-12">
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
          <h2 className="text-xl font-medium text-gray-900 mb-12 leading-relaxed text-left">
            {replaceVariables(question.prompt)}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type={question.type === "email" ? "email" : "text"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.type === "email" ? "Enter your email address" : "Enter your name"}
              className="w-full p-5 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900 text-lg text-center"
              style={{ backgroundColor: '#f6f4ed' }}
              required
            />
            
            <button
              type="submit"
              disabled={!value.trim()}
              className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors duration-150 ${
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
          </form>
        </div>
      </div>
    </div>
  );
}