import React, { useState, useEffect } from "react";

// Custom Select Dropdown Component (Enhanced with better option matching)
const CustomSelect = ({ field, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Better option matching logic
  const selectedOption = field.options.find((opt) => {
    if (typeof value === "string") {
      return opt.value === value;
    }
    return opt.value === value?.value;
  });

  return (
    <div className="relative">
      <div
        className={`w-full px-4 py-3 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between ${
          error
            ? "border-red-300 focus:border-red-500"
            : isOpen || selectedOption
            ? "border-orange-400 shadow-md"
            : "border-gray-300 hover:border-orange-300"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : "Select an option..."}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {field.options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                selectedOption?.value === option.value ? "bg-orange-100" : ""
              }`}
              onClick={() => {
                onChange({
                  value: option.value,
                  label: option.label,
                  docRequired: option.docRequired,
                });
                setIsOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800">{option.label}</span>
                <div className="flex items-center gap-2">
                  {selectedOption?.value === option.value && (
                    <span className="text-orange-600">✓</span>
                  )}
                  {option.docRequired && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      Doc Required
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Document Upload Component (Fixed Replace functionality)
const DocumentUpload = ({
  fieldKey,
  currentFile,
  onChange,
  error,
  existingDocumentUrl = null,
  isEditMode = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Better logic for determining what to show
  const hasExistingDoc =
    isEditMode &&
    existingDocumentUrl &&
    typeof existingDocumentUrl === "string" &&
    existingDocumentUrl.startsWith("http");

  const hasNewFile = currentFile instanceof File;
  const showingExisting = hasExistingDoc && !hasNewFile;
  const showUploadInterface = !hasExistingDoc || hasNewFile;

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
      onChange(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  const getFileName = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split("/").pop() || "financial-document";
    } catch {
      return "financial-document";
    }
  };

  // Handle the replace button properly
  const handleReplaceClick = () => {
    const fileInput = document.querySelector(`input[data-field="${fieldKey}"]`);
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Show existing document if available and no new file selected */}
      {showingExisting && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">
                <svg
                  className="w-6 h-6"
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
                <p className="text-sm font-medium text-green-800">
                  Current Financial Document
                </p>
                <p className="text-xs text-green-600">
                  {getFileName(existingDocumentUrl)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={existingDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                💰 View
              </a>
              <button
                type="button"
                onClick={handleReplaceClick}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload interface */}
      {showUploadInterface && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
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
            type="file"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx,.jpg,.png,.xlsx"
            data-field={fieldKey}
          />

          {hasNewFile ? (
            <div className="flex items-center justify-center">
              <div className="text-green-600">
                <svg
                  className="w-6 h-6 mx-auto mb-1"
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
                <p className="text-sm font-medium">{currentFile.name}</p>
                <p className="text-xs text-gray-500">
                  New financial document selected (
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove new document
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">
              <svg
                className="w-6 h-6 mx-auto mb-1"
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
              <p className="text-xs text-gray-600">
                {hasExistingDoc
                  ? "Drop new financial document to replace current file"
                  : "Drop financial documents or click to browse"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, XLSX, JPG, PNG (Financial records, funding
                documents, revenue reports)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for replace functionality */}
      {showingExisting && (
        <input
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.png,.xlsx"
          data-field={fieldKey}
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default function WealthGrading({
  values,
  onChange,
  isEditMode = false,
  hasExistingDocument,
  getDocumentUrl,
}) {
  const [errors, setErrors] = useState({});

  // Field configuration (unchanged)
  const fields = [
    {
      key: "fundingObtained",
      label:
        "Funding Obtained from any external source (Both Government & Private Funding)",
      required: true,
      options: [
        {
          value: "NO_FUNDING",
          label: "No Funding Obtained / Bootstrapped",
          docRequired: false,
        },
        {
          value: "FUNDING_UPTO_1CR",
          label: "Upto 1 Cr (including 1 Cr)",
          docRequired: true,
        },
        {
          value: "FUNDING_1_10CR",
          label: "From 1 Cr to 10 Cr (Including 10 Cr)",
          docRequired: true,
        },
        {
          value: "FUNDING_ABOVE_10CR",
          label: "More than 10 Cr",
          docRequired: true,
        },
      ],
      note: [
        "Declaration Regarding Funding Obtained and Investor Details (Suggested Format on Company's Letterhead):",
        "",
        "This letter serves as a request for the declaration regarding the funding obtained by our company, as per the categories outlined below. Kindly note that we have attached the relevant supporting documentation for your reference.",
        "",
        "Funding Received:",
        "",
        "Please find the details of the funding obtained by [Company Name] in the following categories: Up to 1 Crore (including 1 Crore)",
        "[ ] Confirmed (Amount: [Insert Amount])",
        "From 1 Crore to 10 Crore (including 10 Crore)",
        "[ ] Confirmed (Amount: [Insert Amount])",
        "More than 10 Crore",
        "[ ] Confirmed (Amount: [Insert Amount])",
        "Investor Details:",
        "",
        "In accordance with the funding obtained, please find below the details of the investors who have contributed to the funding:",
        "Investor 1 Name: [Insert Name]",
        "Investment Amount: [Insert Amount]",
        "Investment Date: [Insert Date]",
        "Type of Investment: [Equity/Loan/Convertible Note/Other]",
        "Investor 2 Name: [Insert Name]",
        "Investment Amount: [Insert Amount]",
        "Investment Date: [Insert Date]",
        "Type of Investment: [Equity/Loan/Convertible Note/Other]",
        "[Continue adding more investors as needed]",
        "Supporting Documentation:",
        "",
        "We have attached the relevant proof of funding obtained, including but not limited to:",
        "",
        "- Official funding letters",
        "",
        "- Bank statements showing the receipt of funds",
        "",
        "- Investment agreements or term sheets",
        "",
        "- Other relevant documents substantiating the funding",
        "",
        "Kindly ensure that the information provided is accurate and that all required documentation is included. If further details or clarification are needed, we are available to provide additional information or documentation as requested.",
        "",
        "Note: The declaration must be on the letterhead of the company, Signed by the Directors/Partners of the startup.",
      ],
    },
    {
      key: "revenueGeneration",
      label: "Revenue Generation",
      required: true,
      options: [
        { value: "NO_REVENUE", label: "No Revenue", docRequired: false },
        {
          value: "REVENUE_UPTO_1CR",
          label: "Revenue Upto 1 Cr (including 1 Cr)",
          docRequired: true,
        },
        {
          value: "REVENUE_1_10CR",
          label: "Revenue 1-10 Cr (including 10 Cr)",
          docRequired: true,
        },
        {
          value: "REVENUE_ABOVE_10CR",
          label: "Revenue more than 10 Cr",
          docRequired: true,
        },
      ],
      note: [
        "Audited P&L Statement for the latest financial year, with revenue highlighted",
      ],
    },
    {
      key: "profitability",
      label: "Profitability",
      required: true,
      options: [
        { value: "LOSS", label: "Incurring Loss", docRequired: false },
        {
          value: "NO_PROFIT_NO_LOSS",
          label: "No Profit / No Loss",
          docRequired: false,
        },
        {
          value: "PROFIT_LATEST_YEAR",
          label: "Profit in latest Financial Year",
          docRequired: true,
        },
        {
          value: "PROFIT_2_PLUS_YEARS",
          label: "Profit for past 2+ years",
          docRequired: true,
        },
      ],
      note: [
        "Audited P&L Statement for the past 2 years, with profit highlighted (merge in one PDF)",
      ],
    },
  ];

  // MAIN FIX: Helper function to check if document is required based on fields array
  const isDocumentRequired = (fieldKey, selectedValue) => {
    if (!selectedValue) return false;

    const field = fields.find((f) => f.key === fieldKey);
    if (!field) return false;

    const option = field.options.find((opt) => opt.value === selectedValue);
    return option ? option.docRequired : false;
  };

  // Get existing document URL for a field
  const getExistingDocumentUrl = (fieldKey) => {
    if (isEditMode && hasExistingDocument && getDocumentUrl) {
      return getDocumentUrl(`wealthGrading.${fieldKey}.document`);
    }
    return null;
  };

  // Enhanced validation function for edit mode
  const validateAllFields = () => {
    let allErrors = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const fieldData = values.wealthGrading?.[field.key];

      // Check if required field is selected
      if (field.required && (!fieldData || !fieldData.value)) {
        allErrors[field.key] = "This field is required";
        hasErrors = true;
        console.log(`❌ Field ${field.key} is required but not selected`);
      }

      // MAIN FIX: Enhanced document validation using fields array
      if (fieldData?.value) {
        const docRequired = isDocumentRequired(field.key, fieldData.value);
        console.log(
          `Document required for ${field.key} (${fieldData.value}):`,
          docRequired
        );

        if (docRequired) {
          const existingDocUrl = getExistingDocumentUrl(field.key);
          const hasNewFile = fieldData.document instanceof File;
          const hasExistingFile =
            existingDocUrl &&
            typeof existingDocUrl === "string" &&
            existingDocUrl.startsWith("http");

          // In edit mode, either existing file OR new file is acceptable
          if (isEditMode) {
            if (!hasNewFile && !hasExistingFile) {
              allErrors[`${field.key}Doc`] =
                "Financial document is required for this selection";
              hasErrors = true;
              console.log(
                `❌ Field ${field.key} requires document but none found (edit mode)`
              );
            } else {
              console.log(
                `✅ Field ${field.key} document requirement satisfied (edit mode)`
              );
            }
          } else {
            // In create mode, new file is required
            if (!hasNewFile) {
              allErrors[`${field.key}Doc`] =
                "Financial document is required for this selection";
              hasErrors = true;
              console.log(
                `❌ Field ${field.key} requires document but none uploaded (create mode)`
              );
            }
          }
        }
      }

      // Log successful validations
      if (fieldData?.value && !isDocumentRequired(field.key, fieldData.value)) {
        console.log(`✅ Field ${field.key} is valid (no document required)`);
      }
    });

    // Update errors state
    setErrors(allErrors);

    const isValid = !hasErrors;
    console.log(
      `Wealth Grading validation result: ${isValid ? "✅ PASSED" : "❌ FAILED"}`
    );
    console.log("Errors found:", allErrors);

    return isValid;
  };

  // MAIN FIX: Enhanced dropdown change handler using fields array check
  const handleDropdownChange = (fieldKey, selectedOption) => {
    const currentField = values.wealthGrading?.[fieldKey] || {};
    const existingDocUrl = getExistingDocumentUrl(fieldKey);

    // Check document requirement from fields array
    const docRequired = isDocumentRequired(fieldKey, selectedOption.value);

    // Preserve existing document URL in edit mode when document is required
    let documentValue = null;
    if (docRequired) {
      if (currentField.document instanceof File) {
        // Keep new file if user uploaded one
        documentValue = currentField.document;
      } else if (isEditMode && existingDocUrl) {
        // Keep existing URL in edit mode
        documentValue = existingDocUrl;
      }
    }

    onChange(`wealthGrading.${fieldKey}`, {
      value: selectedOption.value,
      label: selectedOption.label,
      docRequired: docRequired, // Use the check from fields array
      document: documentValue,
    });

    // Clear errors for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldKey];
      delete newErrors[`${fieldKey}Doc`];
      return newErrors;
    });
  };

  // Enhanced handle document upload for edit mode
  const handleDocumentUpload = (fieldKey, file) => {
    const currentField = values.wealthGrading?.[fieldKey] || {};
    onChange(`wealthGrading.${fieldKey}`, {
      ...currentField,
      document: file, // This will be either a File object or null
    });

    // Clear document error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${fieldKey}Doc`];
      return newErrors;
    });
  };

  // Expose validation function to parent
  useEffect(() => {
    window.validateWealthGrading = validateAllFields;

    return () => {
      // Cleanup
      if (window.validateWealthGrading === validateAllFields) {
        delete window.validateWealthGrading;
      }
    };
  }, [values, isEditMode]); // Re-register when values or edit mode changes

  return (
    <div className="bg-white rounded-xl border border-orange-100 shadow-sm">
      {/* Header with edit mode indicator */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
            💰
          </span>
          Wealth Grading
          {isEditMode && (
            <span className="ml-3 px-2 py-1 text-xs bg-blue-500 bg-opacity-20 text-white rounded-full">
              Editing
            </span>
          )}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {fields.map((field, index) => {
          const fieldData = values.wealthGrading?.[field.key] || {};
          const existingDocUrl = getExistingDocumentUrl(field.key);

          // MAIN FIX: Check document requirement from fields array
          const docRequiredForCurrentSelection = fieldData.value
            ? isDocumentRequired(field.key, fieldData.value)
            : false;

          return (
            <div
              key={field.key}
              className="bg-gray-50 rounded-xl p-5 border border-gray-100"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="inline-flex items-center">
                  <span className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    {index + 1}
                  </span>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                  {isEditMode && existingDocUrl && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                      Has Document
                    </span>
                  )}
                </span>
              </label>

              <CustomSelect
                field={field}
                value={fieldData}
                onChange={(selectedOption) =>
                  handleDropdownChange(field.key, selectedOption)
                }
                error={errors[field.key]}
              />

              {errors[field.key] && (
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
                  {errors[field.key]}
                </p>
              )}

              {/* MAIN FIX: Document Upload based on fields array check */}
              {docRequiredForCurrentSelection && (
                <DocumentUpload
                  fieldKey={field.key}
                  currentFile={fieldData.document}
                  onChange={(file) => handleDocumentUpload(field.key, file)}
                  error={errors[`${field.key}Doc`]}
                  existingDocumentUrl={existingDocUrl}
                  isEditMode={isEditMode}
                />
              )}

              {docRequiredForCurrentSelection && (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                  {/* Content */}
                  <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
                    <div className="px-5 py-4 space-y-3">
                      {field.note.map((note, idx) => (
                        <div key={idx}>
                          {note === "" ? (
                            <div className="h-2" />
                          ) : (
                            <div className="flex items-start gap-3">
                              {/* Bullet point or number */}
                              <div className="flex-shrink-0 mt-1.5">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              </div>

                              {/* Note content */}
                              <p
                                className={`
                  text-sm leading-relaxed text-gray-700
                  ${
                    note.toLowerCase().includes("note:") ||
                    note.toLowerCase().includes("important")
                      ? "font-semibold text-blue-800 bg-yellow-50 px-3 py-2 rounded-lg border-l-4 border-yellow-400"
                      : ""
                  }
                `}
                              >
                                {note}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border-t border-red-100 px-6 py-4 rounded-b-xl">
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
              <p className="text-red-700 text-sm font-medium mb-2">
                Please complete all required fields and upload necessary
                financial documents
              </p>
              <div className="text-red-600 text-xs space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
