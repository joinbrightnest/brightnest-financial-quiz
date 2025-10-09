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
}

export default function OptionButton({ option, isSelected, onClick, disabled = false }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-5 text-center rounded-lg transition-colors duration-150 ${
        disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : isSelected
          ? "bg-teal-600 text-white"
          : "bg-amber-50 text-gray-900 hover:bg-amber-100 border border-amber-100"
      }`}
    >
      <span className="text-lg font-medium">{option.label}</span>
    </button>
  );
}