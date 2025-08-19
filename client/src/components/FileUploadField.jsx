// src/components/FileUploadField.jsx
import React from "react";

export default function FileUploadField({
  label,
  value,
  onChange,
  accept = "*/*",
  required = false,
  existingUrl = null,
  fieldPath = "",
  className = "",
}) {
  const hasExistingFile =
    existingUrl &&
    typeof existingUrl === "string" &&
    existingUrl.startsWith("http");
  const hasNewFile = value instanceof File;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange(fieldPath, file);
  };

  const handleRemoveFile = () => {
    onChange(fieldPath, null);
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
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Show existing file if available and no new file selected */}
      {hasExistingFile && !hasNewFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">📄</div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Existing Document
                </p>
                <p className="text-xs text-green-600">
                  {getFileName(existingUrl)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={existingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                View
              </a>
              <button
                type="button"
                onClick={() => {
                  // Switch to upload mode
                  const fileInput = document.querySelector(
                    `input[data-field="${fieldPath}"]`
                  );
                  if (fileInput) fileInput.click();
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show new file if selected */}
      {hasNewFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">📄</div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  New Document Selected
                </p>
                <p className="text-xs text-blue-600">
                  {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Show upload field when no existing file or when replacing */}
      {(!hasExistingFile || hasNewFile) && (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            data-field={fieldPath}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Upload field when existing file exists but hidden */}
      {hasExistingFile && !hasNewFile && (
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          data-field={fieldPath}
          className="hidden"
        />
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        {hasExistingFile && !hasNewFile
          ? "Current file is saved. Click 'Replace' to upload a new file."
          : "Choose a file to upload or drag and drop"}
      </p>
    </div>
  );
}
