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
      className={`w-full p-5 text-center rounded-lg transition-all duration-200 ${
        isSelected
          ? "bg-teal-600 text-white"
          : "bg-amber-50 text-gray-900 hover:bg-amber-100 border border-amber-100"
      }`}
    >
      <span className="text-lg font-medium">{option.label}</span>
    </button>
  );
}
