// src/components/InfoHeader.jsx
import React from "react";

const InfoHeader = ({
  title = "Toolkit for Financial Statements",
  note = "Updated financial statements (Balance Sheet, Profit & Loss statement) for the past three years or from the year of incorporation",
  subtitle = "Note - The Balance Sheet and the Profit and Loss Statement must be CA Certified",
  showSubtitle = true,
  className = "",
  size = "md", // "sm", "md", "lg"
  variant = "default", // "default", "blue", "gray"
}) => {
  // Size variants
  const sizeClasses = {
    sm: {
      title: "text-lg",
      note: "text-sm",
      subtitle: "text-xs",
    },
    md: {
      title: "text-xl",
      note: "text-base",
      subtitle: "text-sm",
    },
    lg: {
      title: "text-2xl",
      note: "text-lg",
      subtitle: "text-base",
    },
  };

  // Color variants
  const variantClasses = {
    default: {
      title: "text-gray-900",
      note: "text-gray-700",
      subtitle: "text-gray-600",
    },
    blue: {
      title: "text-blue-900",
      note: "text-blue-700",
      subtitle: "text-blue-600",
    },
    gray: {
      title: "text-gray-800",
      note: "text-gray-600",
      subtitle: "text-gray-500",
    },
  };

  return (
    <div className={`space-y-3 ${className} mb-2`}>
      {/* Main Title */}
      <h2
        className={`
        ${sizeClasses[size].title}
        ${variantClasses[variant].title}
        font-semibold leading-tight
      `}
      >
        {title}
      </h2>

      {/* Description/Note */}
      <p
        className={`
        ${sizeClasses[size].note}
        ${variantClasses[variant].note}
        leading-relaxed
        ml-4
      `}
      >
        {note}
      </p>

      {/* Subtitle/Additional Note */}
      {showSubtitle && subtitle && (
        <p
          className={`
          ${sizeClasses[size].subtitle}
          ${variantClasses[variant].subtitle}
          italic leading-relaxed
          ml-4
        `}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default InfoHeader;
