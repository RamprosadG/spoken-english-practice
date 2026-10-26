import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
  iconBgColor = "bg-indigo-50",
  iconColor = "text-indigo-600",
  bgColor = "bg-white",
  borderColor = "border-gray-200",
}) => {
  return (
    <div
      className={`border ${borderColor} rounded-xl shadow-xs hover:shadow-md transition-shadow p-5 max-sm:p-2.5 ${bgColor} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate max-sm:text-xs">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 truncate max-sm:text-sm max-sm:mt-0.5">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 truncate max-sm:text-[10px]">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`shrink-0 p-3 rounded-lg max-sm:p-1.5 ${iconBgColor} ${iconColor}`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
