// src/components/SampleDocDownloader.jsx
import React, { useState } from "react";

const SampleDocDownloader = ({
  fileUrl, // Your public cloud URL
  fileName = "sample-document.docx",
  displayName = "Download Sample",
  description = "Click to download the sample document",
  showDescription = true,
  className = "",
  size = "md", // "sm", "md", "lg"
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Size variants for text and icon
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleDownload = async () => {
    if (!fileUrl) {
      alert("File URL not provided");
      return;
    }

    setIsDownloading(true);

    try {
      // Create download link
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`flex flex-row text-start gap-2 ${className}`}>
      {/* Description Section */}
      {showDescription && (
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{description}</h3>
          {/* <p className="text-gray-600 text-xs">{description}</p> */}
          {fileName && (
            <p className="text-xs text-gray-500 mt-1">File: {fileName}</p>
          )}
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading || !fileUrl}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center gap-2
          text-blue-600 hover:text-blue-800
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none
          self-start
        `}
      >
        {isDownloading ? (
          <>
            <div
              className={`animate-spin rounded-full border-b-2 border-current ${iconSizes[size]}`}
            ></div>
            Downloading...
          </>
        ) : (
          <>
            <svg
              className={iconSizes[size]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download
          </>
        )}
      </button>
    </div>
  );
};

export default SampleDocDownloader;
