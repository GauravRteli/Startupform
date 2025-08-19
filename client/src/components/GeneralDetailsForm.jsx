import React, { useState, useEffect, useRef } from "react";
import SampleDocDownloader from "./SampleDocDownloader";
import InfoHeader from "./InfoHeader";

// Enhanced Field Configuration - Control required fields dynamically
const FIELD_CONFIG = {
  moaFile: { required: true, defaultValue: null },
  reconstructionFile: { required: true, defaultValue: null },
  startupVideoLink: { required: true, defaultValue: "" },
  incomeTaxReturns: {
    fy2024_25: { required: false, defaultValue: null },
    fy2023_24: { required: false, defaultValue: null },
    fy2022_23: { required: false, defaultValue: null },
  },
  annualAccounts: {
    balanceSheet: { required: false, defaultValue: null },
    profitLossDoc: { required: false, defaultValue: null },
    revenue: { required: true, defaultValue: 0 },
    profitLoss: { required: true, defaultValue: 0 },
  },
};

// Helper function to check if field is required from FIELD_CONFIG
const isFieldRequired = (fieldPath) => {
  const keys = fieldPath.split(".");
  let config = FIELD_CONFIG;

  for (const key of keys) {
    if (config[key]) {
      config = config[key];
    } else {
      return false;
    }
  }

  return config.required === true;
};

// Premium Number Input for Table (Enhanced with dynamic required checking)
const TableNumberInput = ({
  value,
  onChange,
  placeholder,
  fieldPath, // NEW: Pass field path to check required status
  error = null,
}) => {
  // Check if field is required from FIELD_CONFIG
  const required = isFieldRequired(fieldPath);

  return (
    <div className="w-full">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        // placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm bg-white ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const TableFileUpload = ({
  onFileChange,
  acceptedFile,
  placeholder = "Upload Document",
  fieldPath,
  error = null,
  existingFileUrl = null,
  isEditMode = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const fileInputRef = useRef(null);

  // Check if field is required from FIELD_CONFIG
  const required = isFieldRequired(fieldPath);

  // Better logic for existing documents
  const hasExistingFile =
    isEditMode &&
    existingFileUrl &&
    typeof existingFileUrl === "string" &&
    existingFileUrl.startsWith("http");

  const hasNewFile = acceptedFile instanceof File;
  const showingExisting =
    hasExistingFile && !hasNewFile && !showUploadInterface;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileChange(files[0]);
      setShowUploadInterface(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
      setShowUploadInterface(false);
    }
  };

  const getFileName = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split("/").pop() || "document";
    } catch {
      return "document";
    }
  };

  // Handle the replace button properly
  const handleReplaceClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUploadInterface(true);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  // NEW: Handle remove existing file
  const handleRemoveExisting = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFileChange(null); // Set to null to remove file
    setShowUploadInterface(true); // Show upload interface
  };

  // NEW: Handle cancel replacement
  const handleCancelReplace = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUploadInterface(false);
  };

  return (
    <div className="space-y-2">
      {/* Show existing file with View, Replace, and Remove buttons */}
      {showingExisting && (
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2 shadow-sm hover:shadow-md transition-all duration-200">
          {/* File Status Indicator */}
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>

          {/* File Info */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <svg
              className="w-3.5 h-3.5 text-green-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span
              className="text-xs text-gray-700 font-medium"
              title={getFileName(existingFileUrl)}
            >
              {getFileName(existingFileUrl).length > 15
                ? getFileName(existingFileUrl).slice(0, 15) + "..."
                : getFileName(existingFileUrl)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <a
              href={existingFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View file"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </a>

            <button
              type="button"
              onClick={handleReplaceClick}
              className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Replace file"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {!required && (
              <button
                type="button"
                onClick={handleRemoveExisting}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove file"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload interface */}
      {(showUploadInterface || !hasExistingFile) && (
        <div>
          {/* Show cancel button if we're in replace mode */}
          {showUploadInterface && hasExistingFile && (
            <div className="mb-2">
              <button
                type="button"
                onClick={handleCancelReplace}
                className="text-xs text-gray-600 hover:text-gray-800 underline flex items-center"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-all duration-200 cursor-pointer ${
              error
                ? "border-red-300 bg-red-50"
                : isDragging
                ? "border-orange-400 bg-orange-50"
                : hasNewFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-orange-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.xlsx"
              data-field={fieldPath}
            />

            {hasNewFile ? (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-green-600 font-medium">
                  New File Selected
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-xs text-gray-500">
                  {showUploadInterface && hasExistingFile
                    ? `Replace ${placeholder}`
                    : required
                    ? `${placeholder} *`
                    : `${placeholder} (Optional)`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show new file details */}
      {hasNewFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-xs text-blue-700 font-medium truncate max-w-32">
                {acceptedFile.name}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null); // Set to null to remove new file
                setShowUploadInterface(false);
              }}
              className="text-red-500 hover:text-red-700 ml-2"
              title="Remove new file"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
// hello
const FileUploadBox = ({
  label,
  onFileChange,
  acceptedFile,
  description,
  fieldPath,
  error = null,
  existingFileUrl = null,
  isEditMode = false,
  compo = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const fileInputRef = useRef(null);

  // Check if field is required from FIELD_CONFIG
  const required = isFieldRequired(fieldPath);

  // Check if we have an existing file (URL) vs new file (File object)
  const hasExistingFile =
    isEditMode &&
    existingFileUrl &&
    typeof existingFileUrl === "string" &&
    existingFileUrl.startsWith("http");
  const hasNewFile = acceptedFile instanceof File;
  const showingExisting =
    hasExistingFile && !hasNewFile && !showUploadInterface;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileChange(files[0]);
      setShowUploadInterface(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
      setShowUploadInterface(false);
    }
  };

  // Handle replace button click
  const handleReplaceClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setShowUploadInterface(true);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  // NEW: Handle remove existing file
  const handleRemoveExisting = (e) => {
    e.preventDefault();
    e.stopPropagation();

    onFileChange(null); // Set to null to remove file
    setShowUploadInterface(true); // Show upload interface
  };

  // Handle cancel replacement
  const handleCancelReplace = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUploadInterface(false);
    // Clear any selected file if user cancels
    if (hasNewFile) {
      onFileChange(null);
    }
  };

  const getFileName = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split("/").pop() || "document";
    } catch {
      return "document";
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      )}

      {/* Show existing file if in edit mode and no new file selected and not replacing */}
      {showingExisting && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3 shadow-sm">
          <div className="flex items-center justify-between">
            {/* File Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {getFileName(existingFileUrl)}
                </p>
                <p className="text-xs text-green-600">Current document</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-2">
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="View document"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </a>

              <button
                type="button"
                onClick={handleReplaceClick}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                title="Replace document"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {!required && (
                <button
                  type="button"
                  onClick={handleRemoveExisting}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  title="Remove document"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload interface - shown when no existing file, when replacing, or when new file selected */}
      {(!showingExisting || hasNewFile) && (
        <div>
          {/* Show cancel button if we're in replace mode */}
          {showUploadInterface && hasExistingFile && !hasNewFile && (
            <div className="mb-3">
              <button
                type="button"
                onClick={handleCancelReplace}
                className="text-xs text-gray-600 hover:text-gray-800 underline flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel replacement
              </button>
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
              ${
                error
                  ? "border-red-300 bg-red-50"
                  : isDragging
                  ? "border-orange-400 bg-orange-50"
                  : hasNewFile
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-orange-300 hover:bg-orange-25"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.jpg,.png"
            />

            {hasNewFile ? (
              <div className="flex items-center justify-center">
                <div className="text-green-600">
                  <svg
                    className="w-8 h-8 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium">{acceptedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    New file selected (
                    {(acceptedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileChange(null);
                      setShowUploadInterface(false);
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Remove new file
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <svg
                  className="w-10 h-10 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-600">
                  {showUploadInterface
                    ? "Select new file to replace current document"
                    : required
                    ? "Drop required file here or click to browse"
                    : "Drop your file here or click to browse (Optional)"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {compo && <div className="text-start mt-4">{compo}</div>}

      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Input Field Component (Enhanced with dynamic required checking)
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  fieldPath, // NEW: Pass field path to check required status
  error = null,
}) => {
  // Check if field is required from FIELD_CONFIG
  const required = isFieldRequired(fieldPath);

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 shadow-sm ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default function GeneralDetailsForm({
  data,
  onChange,
  onNext,
  isEditMode = false,
  hasExistingDocument,
  getDocumentUrl,
}) {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Initialize default values if data is missing
  const getFieldValue = (fieldPath, defaultValue) => {
    const keys = fieldPath.split(".");
    let value = data;
    for (const key of keys) {
      value = value?.[key];
    }
    return value !== undefined && value !== null ? value : defaultValue;
  };

  // Get existing document URL for a field
  const getExistingFileUrl = (fieldPath) => {
    if (isEditMode && hasExistingDocument && getDocumentUrl) {
      return getDocumentUrl(fieldPath);
    }
    return null;
  };

  // Enhanced validation function - now uses FIELD_CONFIG exclusively
  const validateField = (fieldPath, value, isRequired) => {
    // Check required status from FIELD_CONFIG instead of parameter
    const actuallyRequired = isFieldRequired(fieldPath);

    if (!actuallyRequired) return null;

    // In edit mode, if we have an existing file and no new file, that's valid
    if (
      isEditMode &&
      (fieldPath.includes("File") || fieldPath.includes("incomeTaxReturns"))
    ) {
      const existingUrl = getExistingFileUrl(fieldPath);
      if (existingUrl && !value) {
        return null; // Valid - we have existing file
      }
      if (!existingUrl && !value) {
        return "This field is required";
      }
      return null;
    }

    if (fieldPath.includes("File") || fieldPath.includes("incomeTaxReturns")) {
      return !value ? `This field is required` : null;
    }

    if (fieldPath === "startupVideoLink") {
      if (!value || value.trim() === "") {
        return "Startup video link is required";
      }
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(value)) {
        return "Please enter a valid URL starting with http:// or https://";
      }
      return null;
    }

    if (fieldPath.includes("revenue") || fieldPath.includes("profitLoss")) {
      return value === null || value === undefined
        ? "This field is required"
        : null;
    }

    return !value ? "This field is required" : null;
  };

  // Enhanced validateAllFields function with better FIELD_CONFIG usage
  const validateAllFields = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate main fields using FIELD_CONFIG
    Object.keys(FIELD_CONFIG).forEach((fieldKey) => {
      if (fieldKey === "incomeTaxReturns") {
        Object.keys(FIELD_CONFIG.incomeTaxReturns).forEach((fyKey) => {
          const fieldPath = `incomeTaxReturns.${fyKey}`;
          const value = getFieldValue(
            fieldPath,
            FIELD_CONFIG.incomeTaxReturns[fyKey].defaultValue
          );
          const error = validateField(
            fieldPath,
            value,
            FIELD_CONFIG.incomeTaxReturns[fyKey].required
          );
          if (error) {
            newErrors[fieldPath] = error;
            hasErrors = true;
            console.log(`❌ Field ${fieldPath}: ${error}`);
          } else {
            console.log(`✅ Field ${fieldPath} is valid`);
          }
        });
      } else if (fieldKey === "annualAccounts") {
        // Validate annual accounts table
        data.annualAccounts?.forEach((row, idx) => {
          Object.keys(FIELD_CONFIG.annualAccounts).forEach((subKey) => {
            const fieldPath = `annualAccounts[${idx}].${subKey}`;
            const value = row[subKey];
            const error = validateField(
              fieldPath,
              value,
              FIELD_CONFIG.annualAccounts[subKey].required
            );
            if (error) {
              newErrors[fieldPath] = error;
              hasErrors = true;
              console.log(`❌ Field ${fieldPath}: ${error}`);
            } else {
              console.log(`✅ Field ${fieldPath} is valid`);
            }
          });
        });
      } else {
        const value = getFieldValue(
          fieldKey,
          FIELD_CONFIG[fieldKey].defaultValue
        );
        const error = validateField(
          fieldKey,
          value,
          FIELD_CONFIG[fieldKey].required
        );
        if (error) {
          newErrors[fieldKey] = error;
          hasErrors = true;
          console.log(`❌ Field ${fieldKey}: ${error}`);
        } else {
          console.log(`✅ Field ${fieldKey} is valid`);
        }
      }
    });

    setErrors(newErrors);

    const isValid = !hasErrors;
    console.log(
      `General Details validation result: ${
        isValid ? "✅ PASSED" : "❌ FAILED"
      }`
    );
    console.log("Errors found:", newErrors);

    return isValid;
  };

  const handleContinue = () => {
    setIsValidating(true);
    const isValid = validateAllFields();

    if (isValid) {
      // Apply default values for non-required fields if they're empty
      const updatedData = { ...data };

      // Set defaults for income tax returns if not required
      Object.keys(FIELD_CONFIG.incomeTaxReturns).forEach((fyKey) => {
        if (
          !FIELD_CONFIG.incomeTaxReturns[fyKey].required &&
          !updatedData.incomeTaxReturns?.[fyKey]
        ) {
          if (!updatedData.incomeTaxReturns) updatedData.incomeTaxReturns = {};
          updatedData.incomeTaxReturns[fyKey] =
            FIELD_CONFIG.incomeTaxReturns[fyKey].defaultValue;
        }
      });

      // Set defaults for annual accounts if not required
      updatedData.annualAccounts?.forEach((row, idx) => {
        Object.keys(FIELD_CONFIG.annualAccounts).forEach((subKey) => {
          if (
            !FIELD_CONFIG.annualAccounts[subKey].required &&
            (row[subKey] === null || row[subKey] === undefined)
          ) {
            updatedData.annualAccounts[idx][subKey] =
              FIELD_CONFIG.annualAccounts[subKey].defaultValue;
          }
        });
      });

      onNext();
    } else {
      // Scroll to first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector(".border-red-300");
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
    setIsValidating(false);
  };

  const handleAnnualAccountsChange = (index, field, value) => {
    const updated = [...(data.annualAccounts || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange("annualAccounts", updated);

    // Clear error for this field
    const errorKey = `annualAccounts[${index}].${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleFieldChange = (fieldPath, value) => {
    onChange(fieldPath, value);

    // Clear error for this field
    if (errors[fieldPath]) {
      setErrors((prev) => ({ ...prev, [fieldPath]: undefined }));
    }
  };

  useEffect(() => {
    // Make the validation function available globally
    window.validateGeneralDetails = validateAllFields;

    return () => {
      // Cleanup function to remove the validation function
      if (window.validateGeneralDetails === validateAllFields) {
        delete window.validateGeneralDetails;
      }
    };
  }, [data, isEditMode]); // Re-register when data or edit mode changes

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          General Details{" "}
          {isEditMode && <span className="text-orange-600">(Editing)</span>}
        </h2>
        <p className="text-gray-600">
          {isEditMode
            ? "Update your documents and basic information"
            : "Upload your documents and provide basic information"}
        </p>
      </div>

      <div className="space-y-8 text-start">
        {/* Document Uploads */}
        <div className="grid md:grid-cols-2 gap-6">
          <FileUploadBox
            label="Memorandum of Association / LLP Deed"
            fieldPath="moaFile" // NEW: Pass field path
            onFileChange={(file) => handleFieldChange("moaFile", file)}
            acceptedFile={getFieldValue(
              "moaFile",
              FIELD_CONFIG.moaFile.defaultValue
            )}
            description="Upload your company's MOA or LLP deed document"
            error={errors.moaFile}
            existingFileUrl={getExistingFileUrl("moaFile")}
            isEditMode={isEditMode}
            compo={
              <InfoHeader
                title="Toolkit for MoA"
                note="You are requested to upload authorized signatory/director certified MoA. If you possess a SPICe MoA then you are requested to please take a printout of the same and upload a scan of the printout or to convert the SPICe MoA into a print-able PDF before uploading. Please do not upload the SPICe MoA as is."
                // subtitle="Note - The Balance Sheet and the Profit and Loss Statement must be CA Certified"
                size="sm"
                variant="gray"
                className="flex flex-col justify-start items-start ml-4"
              />
            }
          />

          <FileUploadBox
            label="Reconstruction (CA Certification)"
            fieldPath="reconstructionFile" // NEW: Pass field path
            onFileChange={(file) =>
              handleFieldChange("reconstructionFile", file)
            }
            acceptedFile={getFieldValue(
              "reconstructionFile",
              FIELD_CONFIG.reconstructionFile.defaultValue
            )}
            description="CA certified reconstruction document"
            error={errors.reconstructionFile}
            existingFileUrl={getExistingFileUrl("reconstructionFile")}
            isEditMode={isEditMode}
          />
        </div>

        {/* Video Link */}
        <InputField
          label="Startup Video Link"
          fieldPath="startupVideoLink" // NEW: Pass field path
          value={getFieldValue(
            "startupVideoLink",
            FIELD_CONFIG.startupVideoLink.defaultValue
          )}
          onChange={(value) => handleFieldChange("startupVideoLink", value)}
          placeholder="https://drive.google.com/..."
          error={errors.startupVideoLink}
        />
        <SampleDocDownloader
          fileUrl="https://jitendra-sengar-bucket.s3.ap-south-1.amazonaws.com/moa-files/Form80IAC_Video_Link_Guidelines_1755176395178.pdf"
          fileName="Form 80-IAC Video Guidelines.pdf"
          displayName="Form 80-IAC Video Guidelines"
          description="Toolkit for Video Link"
        />

        {/* Income Tax Returns */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Income Tax Returns
              </h3>
              <p className="text-xs text-gray-500">
                Upload tax returns for the last 3 financial years
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {["fy2024_25", "fy2023_24", "fy2022_23"].map((fy) => (
              <FileUploadBox
                key={fy}
                label={fy.replace("_", "-").toUpperCase()}
                fieldPath={`incomeTaxReturns.${fy}`} // NEW: Pass field path
                onFileChange={(file) =>
                  handleFieldChange(`incomeTaxReturns.${fy}`, file)
                }
                acceptedFile={getFieldValue(
                  `incomeTaxReturns.${fy}`,
                  FIELD_CONFIG.incomeTaxReturns[fy].defaultValue
                )}
                error={errors[`incomeTaxReturns.${fy}`]}
                existingFileUrl={getExistingFileUrl(`incomeTaxReturns.${fy}`)}
                isEditMode={isEditMode}
              />
            ))}
          </div>
          <InfoHeader
            title="Toolkit for Financial Statements"
            note="Updated financial statements (Income Tax Returns) for the past three years or from the year of incorporation."
            subtitle="Note – The Balance Sheet and the Profit and Loss Statement must be CA Certified"
            size="sm"
            variant="gray"
            className="flex flex-col justify-start items-start ml-4"
          />
        </div>

        {/* Premium Annual Accounts Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Annual Accounts
                </h3>
                <p className="text-orange-100 text-sm">
                  Financial statements for the last 3 years
                </p>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-4 py-4 text-left">
                    <div className="flex items-center">
                      <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                        #
                      </span>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        S.No
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Financial Year
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Balance Sheet
                        {/* Check required from FIELD_CONFIG */}
                        {isFieldRequired("annualAccounts.balanceSheet") && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        P&L Account
                        {/* Check required from FIELD_CONFIG */}
                        {isFieldRequired("annualAccounts.profitLossDoc") && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-5 h-5 text-emerald-500 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Revenue (₹)
                        {/* Check required from FIELD_CONFIG */}
                        {isFieldRequired("annualAccounts.revenue") && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-5 h-5 text-purple-500 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Profit/Loss (₹)
                        {/* Check required from FIELD_CONFIG */}
                        {isFieldRequired("annualAccounts.profitLoss") && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.annualAccounts?.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-6">
                      <div className="flex items-center">
                        <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-lg mr-3">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {row.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <TableFileUpload
                        fieldPath={`annualAccounts.balanceSheet`}
                        onFileChange={(file) =>
                          handleAnnualAccountsChange(idx, "balanceSheet", file)
                        }
                        acceptedFile={row.balanceSheet}
                        placeholder="Balance Sheet"
                        error={errors[`annualAccounts[${idx}].balanceSheet`]}
                        existingFileUrl={row.balanceSheet} // MAIN FIX: Pass the URL directly from row data
                        isEditMode={isEditMode}
                      />
                    </td>
                    <td className="px-4 py-6">
                      <TableFileUpload
                        fieldPath={`annualAccounts.profitLossDoc`}
                        onFileChange={(file) =>
                          handleAnnualAccountsChange(idx, "profitLossDoc", file)
                        }
                        acceptedFile={row.profitLossDoc}
                        placeholder="P&L Statement"
                        error={errors[`annualAccounts[${idx}].profitLossDoc`]}
                        existingFileUrl={row.profitLossDoc} // MAIN FIX: Pass the URL directly from row data
                        isEditMode={isEditMode}
                      />
                    </td>

                    <td className="px-4 py-6">
                      <div className="relative">
                        <span className="absolute left-1 top-2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <TableNumberInput
                          fieldPath={`annualAccounts.revenue`} // NEW: Pass field path
                          value={row.revenue}
                          onChange={(value) =>
                            handleAnnualAccountsChange(idx, "revenue", value)
                          }
                          placeholder="0"
                          error={errors[`annualAccounts[${idx}].revenue`]}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="relative">
                        <span className="absolute left-1 top-2 text-gray-500 text-sm">
                          ₹
                        </span>
                        <TableNumberInput
                          fieldPath={`annualAccounts.profitLoss`} // NEW: Pass field path
                          value={row.profitLoss}
                          onChange={(value) =>
                            handleAnnualAccountsChange(idx, "profitLoss", value)
                          }
                          placeholder="0"
                          error={errors[`annualAccounts[${idx}].profitLoss`]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <InfoHeader
              title="Toolkit for Financial Statements"
              note="Updated financial statements (Balance Sheet, Profit & Loss statement) for the past three years or from the year of incorporation"
              subtitle="Note - The Balance Sheet and the Profit and Loss Statement must be CA Certified"
              size="sm"
              variant="gray"
              className="flex flex-col justify-start items-start ml-4"
            />
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isEditMode
                  ? "Update PDF/Excel files for Balance Sheet and P&L statements"
                  : "Upload PDF/Excel files for Balance Sheet and P&L statements"}
              </div>
              <div className="text-xs text-gray-500">
                All amounts in Indian Rupees (₹)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && isValidating && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mr-3 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-red-800 font-semibold mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          disabled={isValidating}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-2">
            {isValidating
              ? "Validating..."
              : isEditMode
              ? "Update & Continue"
              : "Continue"}
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
