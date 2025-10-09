interface OptionButtonProps {
  option: {
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  };
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  isTransitioning?: boolean;
}

export default function OptionButton({ option, isSelected, onClick, disabled = false, isTransitioning = false }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isTransitioning}
      className={`w-full p-5 text-center rounded-lg transition-all duration-150 ${
        disabled || isTransitioning
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : isSelected
          ? "bg-teal-600 text-white scale-105 shadow-lg"
          : "bg-amber-50 text-gray-900 hover:bg-amber-100 border border-amber-100 hover:scale-102"
      }`}
    >
      <span className="text-lg font-medium">{option.label}</span>
      {isTransitioning && isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
    </button>
  );
}
