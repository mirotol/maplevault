import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  variant?: "equipment" | "mob";
}

export const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
  leftIcon,
  variant = "equipment",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  const themeClasses = {
    equipment: {
      focus: "focus:ring-orange-500/50",
      rotate: "text-orange-400",
      dropdownBg: "card-equipment-bg",
      selected: "bg-orange-500/20 text-orange-300",
      hover: "hover:bg-orange-500/10 hover:text-orange-300",
    },
    mob: {
      focus: "focus:ring-green-500/50",
      rotate: "text-green-400",
      dropdownBg: "card-mob-bg",
      selected: "bg-green-500/20 text-green-300",
      hover: "hover:bg-green-500/10 hover:text-green-300",
    },
  }[variant];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative group ${isOpen ? "z-50" : "z-10"} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full pr-4 bg-black/10 border border-white/10 rounded-xl flex items-center justify-between text-white text-sm cursor-pointer transition-all shadow-inner hover:bg-black/20 hover:border-white/20 focus:outline-hidden focus:ring-1 ${
          themeClasses.focus
        } ${leftIcon ? "pl-9" : "px-4"}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || "Select..."}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/90 transition-all duration-300 ${
            isOpen ? `rotate-180 ${themeClasses.rotate}` : "group-hover:text-white/90"
          }`}
        />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 w-full mt-2 py-2 ${themeClasses.dropdownBg} backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
          <div
            role="listbox"
            className="max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                tabIndex={0}
                className={`px-4 py-2 cursor-pointer text-sm transition-all ${
                  value === option.value
                    ? `${themeClasses.selected} font-medium`
                    : `text-white/70 ${themeClasses.hover}`
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
