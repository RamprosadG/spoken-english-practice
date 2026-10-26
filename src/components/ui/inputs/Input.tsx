import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  hideOptionalText?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  className = "",
  error,
  icon,
  type = "text",
  required = false,
  value,
  onChange,
  hideOptionalText = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex items-center gap-1">
          <label
            htmlFor={props.id || props.name}
            className="text-sm font-medium text-slate-800"
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
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPasswordField && showPassword ? "text" : type}
          className={`
            w-full rounded-lg border px-3.5 py-2 text-sm outline-none 
            bg-white text-slate-900 placeholder:text-gray-400 shadow-xs
            transition-all duration-200
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            hover:border-indigo-400
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }
            ${icon ? "pl-9" : ""}
            ${isPasswordField ? "pr-10" : ""}
            ${className}
          `}
          value={value}
          onChange={onChange}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 cursor-pointer focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <FaRegEyeSlash className="h-4 w-4" />
            ) : (
              <FaRegEye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-red-600 text-xs mt-0.5 font-medium">{error}</span>
      )}
    </div>
  );
};

export default Input;
