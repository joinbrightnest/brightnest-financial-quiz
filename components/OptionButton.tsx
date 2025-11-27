import { memo, useCallback } from "react";

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

const OptionButton = memo(function OptionButton({ option, isSelected, onClick, disabled = false }: OptionButtonProps) {
  const handleClick = useCallback(() => {
    // Immediately show selected state before processing
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full p-5 text-center rounded-lg transition-all duration-200 touch-friendly touch-feedback no-select mobile-transition ${disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : isSelected
            ? "text-white shadow-md"
            : "text-gray-900 hover:shadow-sm border border-gray-300"
        }`}
      style={{
        backgroundColor: disabled
          ? undefined
          : isSelected
            ? '#09727c'
            : '#f6f4ed'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.backgroundColor = '#e8e4d8';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.backgroundColor = '#f6f4ed';
        }
      }}
    >
      <span className="text-lg font-medium">{option.label}</span>
    </button>
  );
});

export default OptionButton;