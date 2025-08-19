import React, { useState, useEffect } from "react";

// Custom Select Dropdown Component (FIXED - same as Innovation Grading)
const CustomSelect = ({ field, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  // FIX 1: Better option matching logic
  const selectedOption = field.options.find((opt) => {
    // Handle both string values and object values
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
              className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                selectedOption?.value === option.value ? "bg-blue-100" : ""
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
                    <span className="text-blue-600">✓</span>
                  )}
                  {option.docRequired ? (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      Doc Required
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      No Doc Required
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

// Enhanced Document Upload Component (FIXED - same as Innovation Grading)
const DocumentUpload = ({
  fieldKey,
  currentFile,
  onChange,
  error,
  existingDocumentUrl = null,
  isEditMode = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // FIX 2: Better logic for determining what to show
  const hasExistingDoc =
    isEditMode &&
    existingDocumentUrl &&
    typeof existingDocumentUrl === "string" &&
    existingDocumentUrl.startsWith("http");

  const hasNewFile = currentFile instanceof File;

  // Show existing document if we have one and no new file is selected
  const showingExisting = hasExistingDoc && !hasNewFile;

  // Show upload interface if no existing doc OR if user wants to replace
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
      return pathname.split("/").pop() || "employee-document";
    } catch {
      return "employee-document";
    }
  };

  // FIX 3: Handle the replace button properly
  const handleReplaceClick = () => {
    // Trigger file input
    const fileInput = document.querySelector(`input[data-field="${fieldKey}"]`);
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Show existing document if available and no new file selected */}
      {showingExisting && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Current Employee Document
                </p>
                <p className="text-xs text-blue-600">
                  {getFileName(existingDocumentUrl)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={existingDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                👥 View
              </a>
              <button
                type="button"
                onClick={handleReplaceClick}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
              ? "border-blue-400 bg-blue-50"
              : hasNewFile
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-25"
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
                  New employee document selected (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-xs text-gray-600">
                {hasExistingDoc
                  ? "Drop new employee document to replace current file"
                  : "Drop employee documents or click to browse"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, XLSX, JPG, PNG (Employment records, payroll,
                workforce data)
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

// Enhanced No Document Required Component
const NoDocumentRequired = ({ isEditMode = false }) => (
  <div className="mt-4 bg-gray-100 rounded-xl p-4 text-center border-2 border-dashed border-gray-300">
    <div className="text-gray-500">
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
      <p className="text-xs font-medium">No Document Required</p>
      <p className="text-xs text-gray-400">
        {isEditMode
          ? "This selection doesn't need supporting documents (no changes needed)"
          : "This selection doesn't need supporting documents"}
      </p>
    </div>
  </div>
);

export default function EmploymentCreation({
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
      key: "directEmployment",
      label: "Direct Employment",
      required: true,
      options: [
        { value: "EMP_LESS_20", label: "Less than 20", docRequired: false },
        { value: "EMP_21_50", label: "Between 21 - 50", docRequired: true },
        { value: "EMP_51_100", label: "Between 51 - 100", docRequired: true },
        { value: "EMP_ABOVE_100", label: "More than 100", docRequired: true },
      ],
      note: [
        "Declaration Regarding Employment Details (Suggested Format on Company's Letterhead)",
        "",
        "This letter serves as a request for the declaration on the following employment-related details, as required for [mention purpose, e.g., regulatory reporting, compliance check, etc.]. Kindly provide the necessary details based on the categories listed below:",
        "",
        "1. Direct Employment (If applicable, please confirm by ticking the box) Please confirm the number of employees based on the following categories:",
        "Less than 20 employees",
        "Between 21 - 50 employees",
        "Between 51 - 100 employees",
        "More than 100 employees",
        "2. Employment of Females, Persons with Disabilities, Persons from SC/ST Categories Please indicate the percentage of employees in the categories of Female, Persons with Disabilities, and SC/ST:",
        "0%",
        "1-25% (including 25%)",
        "25-50%",
        "More than 50%",
        "3. Employees Based in Non-Metro Cities Please confirm the percentage of employees located in non-metro cities:",
        "0%",
        "1-25% (including 25%)",
        "25-50%",
        "More than 50%",
        "Kindly provide the necessary declarations by ticking the appropriate boxes for each category mentioned above, and attach any supporting documents (if applicable). The information provided should be accurate and up-to-date.",
        "",
        "Note: The declaration must be on the letterhead of the company, Signed by the Directors/Partners of the startup.",
      ],
    },
    {
      key: "pwdFemaleEmploymentCount",
      label: "Employment of Females, PwD, SC/ST persons",
      required: true,
      options: [
        { value: "PERCENT_0", label: "0%", docRequired: false },
        {
          value: "PERCENT_1_25",
          label: "1-25% (more than 0, including 25%)",
          docRequired: true,
        },
        {
          value: "PERCENT_25_50",
          label: "25-50% (Including 50%)",
          docRequired: true,
        },
        { value: "PERCENT_ABOVE_50", label: ">50%", docRequired: true },
      ],
      note: [
        "Declaration Regarding Employment Details (Suggested Format on Company's Letterhead)",
        "",
        "This letter serves as a request for the declaration on the following employment-related details, as required for [mention purpose, e.g., regulatory reporting, compliance check, etc.]. Kindly provide the necessary details based on the categories listed below:",
        "",
        "1. Direct Employment (If applicable, please confirm by ticking the box) Please confirm the number of employees based on the following categories:",
        "Less than 20 employees",
        "Between 21 - 50 employees",
        "Between 51 - 100 employees",
        "More than 100 employees",
        "2. Employment of Females, Persons with Disabilities, Persons from SC/ST Categories Please indicate the percentage of employees in the categories of Female, Persons with Disabilities, and SC/ST:",
        "0%",
        "1-25% (including 25%)",
        "25-50%",
        "More than 50%",
        "3. Employees Based in Non-Metro Cities Please confirm the percentage of employees located in non-metro cities:",
        "0%",
        "1-25% (including 25%)",
        "25-50%",
        "More than 50%",
        "Kindly provide the necessary declarations by ticking the appropriate boxes for each category mentioned above, and attach any supporting documents (if applicable). The information provided should be accurate and up-to-date.",
        "",
        "Note: The declaration must be on the letterhead of the company, Signed by the Directors/Partners of the startup.",
      ],
    },
    {
      key: "employeeNonMetroCities",
      label: "Employees based in Non Metro Cities",
      required: true,
      options: [
        { value: "PERCENT_0", label: "0%", docRequired: false },
        {
          value: "PERCENT_1_25",
          label: "1-25% (more than 0, including 25%)",
          docRequired: true,
        },
        {
          value: "PERCENT_25_50",
          label: "25-50% (Including 50%)",
          docRequired: true,
        },
        { value: "PERCENT_ABOVE_50", label: ">50%", docRequired: true },
      ],
      note: [
        "Declaration Regarding Employment Details (Suggested Format on Company's Letterhead)",
        "",
        "This letter serves as a request for the declaration on the following employment-related details, as required for [mention purpose, e.g., regulatory reporting, compliance check, etc.]. Kindly provide the necessary details based on the categories listed below:",
        "",
        "1. Direct Employment (If applicable, please confirm by ticking the box) Please confirm the number of employees based on the following categories:",
        "Less than 20 employees",
        "Between 21 - 50 employees",
        "Between 51 - 100 employees",
        "More than 100 employees",
        "2. Employment of Females, Persons with Disabilities, Persons from SC/ST Categories Please indicate the percentage of employees in the categories of Female, Persons with Disabilities, and SC/ST:",
        "0%",
        "1-25% (including 25%)",
        "25-50%",
        "More than 50%",
        "3. Employees Based in Non-Metro Cities Please confirm the percentage of employees located in non-metro cities:",
        "0%",
        "1-25% (including 25%)",
        "25-50%",
        "More than 50%",
        "Kindly provide the necessary declarations by ticking the appropriate boxes for each category mentioned above, and attach any supporting documents (if applicable). The information provided should be accurate and up-to-date.",
        "",
        "Note: The declaration must be on the letterhead of the company, Signed by the Directors/Partners of the startup.",
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
      return getDocumentUrl(`employmentCreation.${fieldKey}.document`);
    }
    return null;
  };

  // Enhanced validation function for edit mode
  const validateAllFields = () => {
    let allErrors = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const fieldData = values.employmentCreation?.[field.key];

      // Check if required field is selected
      if (field.required && (!fieldData || !fieldData.value)) {
        allErrors[field.key] = "This field is required";
        hasErrors = true;
      }

      // MAIN FIX: Enhanced document validation using fields array
      if (fieldData?.value) {
        const docRequired = isDocumentRequired(field.key, fieldData.value);

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
                "Employee documentation is required for this selection";
              hasErrors = true;
            } else {
              console.log(
                `✅ Field ${field.key} document requirement satisfied (edit mode)`
              );
            }
          } else {
            // In create mode, new file is required
            if (!hasNewFile) {
              allErrors[`${field.key}Doc`] =
                "Employee documentation is required for this selection";
              hasErrors = true;
            }
          }
        }
      }
    });

    // Update errors state
    setErrors(allErrors);

    const isValid = !hasErrors;
    return isValid;
  };

  // FIX 4: Enhanced dropdown change handler using fields array check
  const handleDropdownChange = (fieldKey, selectedOption) => {
    const currentField = values.employmentCreation?.[fieldKey] || {};
    const existingDocUrl = getExistingDocumentUrl(fieldKey);

    // MAIN FIX: Check document requirement from fields array
    const docRequired = isDocumentRequired(fieldKey, selectedOption.value);
    console.log(
      `Document required for ${fieldKey} (${selectedOption.value}):`,
      docRequired
    );

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

    onChange(`employmentCreation.${fieldKey}`, {
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
    const currentField = values.employmentCreation?.[fieldKey] || {};
    onChange(`employmentCreation.${fieldKey}`, {
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
    window.validateEmploymentCreation = validateAllFields;

    return () => {
      // Cleanup
      if (window.validateEmploymentCreation === validateAllFields) {
        delete window.validateEmploymentCreation;
      }
    };
  }, [values, isEditMode]); // Re-register when values or edit mode changes

  return (
    <div className="bg-white rounded-xl border border-orange-100 shadow-sm">
      {/* Header with edit mode indicator */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
            👥
          </span>
          Employment Creation
          {isEditMode && (
            <span className="ml-3 px-2 py-1 text-xs bg-green-500 bg-opacity-20 text-white rounded-full">
              Editing
            </span>
          )}
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {fields.map((field, index) => {
          const fieldData = values.employmentCreation?.[field.key] || {};
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
                  <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                    {index + 1}
                  </span>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                  {isEditMode && existingDocUrl && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
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

              {/* MAIN FIX: Document Upload or No Document Required based on fields array */}
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
                employee documentation
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
