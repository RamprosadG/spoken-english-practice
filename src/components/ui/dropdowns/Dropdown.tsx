
"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoIosStar, IoIosArrowDown } from "react-icons/io";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  hideOptionalText?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className = "",
  error,
  required = false,
  placeholder = "Select an option",
  name,
  id,
  hideOptionalText = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full" ref={dropdownRef}>
      {label && (
        <div className="flex items-center gap-1">
          <label
            htmlFor={name || id}
            className="text-sm font-medium text-slate-800"
            onClick={() => buttonRef.current?.focus()}
          >
            {label}
          </label>

          {required ? (
            <IoIosStar className="text-red-500 w-2 h-2 mb-1.5" />
          ) : (
            !hideOptionalText && (
              <span className="text-gray-400 text-xs font-normal">
                (Optional)
              </span>
            )
          )}
        </div>
      )}

      <div className="relative w-full min-w-0">
        <button
          ref={buttonRef}
          id={id}
          name={name}
          type="button"
          className={`
            w-full min-w-0 border rounded-lg px-3.5 py-2 text-sm outline-none font-normal bg-white text-slate-900 shadow-xs
            focus:ring-2 flex items-center justify-between gap-2 cursor-pointer transition-all duration-200
            hover:border-indigo-400
            ${error ? "border-red-500" : "border-gray-300"}
            ${isOpen ? "ring-2 ring-indigo-500 border-indigo-500" : "focus:ring-indigo-500"}
            ${className}
          `}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span
            className={`block flex-1 min-w-0 truncate whitespace-nowrap text-left ${selectedOption
                ? "text-slate-900 font-medium"
                : "text-gray-400"
              }`}
            title={selectedOption?.label ?? placeholder}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <IoIosArrowDown
            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto sidebar-scrollbar">
            <ul role="listbox" className="py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`
                    px-3.5 py-2 text-sm cursor-pointer hover:bg-indigo-50 transition-colors duration-150
                    ${value === option.value
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-gray-700"
                    }
                  `}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <span className="text-red-600 text-xs mt-0.5 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};

export default Dropdown;
