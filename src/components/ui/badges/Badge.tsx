import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
  size?: "sm" | "md";
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color,
  variant,
  className = "",
  size = "md",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
  };

  if (color) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full capitalize ${sizeStyles[size]} ${className}`}
        style={{
          backgroundColor: `${color}18`,
          color: color,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
          style={{ backgroundColor: color }}
        />
        {children}
      </span>
    );
  }

  const chosenVariant = variant ? variantStyles[variant] : variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full capitalize ${sizeStyles[size]} ${chosenVariant} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
