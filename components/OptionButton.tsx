interface OptionButtonProps {
  option: {
    label: string;
    value: string;
    weightCategory: string;
    weightValue: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function OptionButton({ option, isSelected, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 text-blue-900"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span className="font-medium">{option.label}</span>
    </button>
  );
}
