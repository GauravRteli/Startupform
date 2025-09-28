// src/components/MultiStepForm.jsx
import React, { useState, useEffect } from "react";
import GeneralDetailsForm from "./GeneralDetailsForm";
import BroadParameters from "./BroadParameters";
import startupAPI from "../services/api";

export default function MultiStepForm({
  mode = "create", // "create" or "edit"
  applicationId = null,
  onClose = null, // For modal/overlay usage
}) {
  const defaultValues = {
    moaFile: null,
    reconstructionFile: null,
    startupVideoLink: "",
    incomeTaxReturns: {
      fy2024_25: null,
      fy2023_24: null,
      fy2022_23: null,
    },
    annualAccounts: [
      {
        year: "2024-2025",
        revenue: 0,
        profitLoss: 0,
        balanceSheet: null,
        profitLossDoc: null,
      },
      {
        year: "2023-2024",
        revenue: 0,
        profitLoss: 0,
        balanceSheet: null,
        profitLossDoc: null,
      },
      {
        year: "2022-2023",
        revenue: 0,
        profitLoss: 0,
        balanceSheet: null,
        profitLossDoc: null,
      },
    ],
    innovationGrading: {},
    wealthGrading: {},
    employmentCreation: {},
  };

  const [values, setValues] = useState(defaultValues);
  const [originalData, setOriginalData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = mode === "edit";

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && applicationId) {
      loadApplicationData();
    }
  }, [isEditMode, applicationId]);

  const loadApplicationData = async () => {
    setIsLoading(true);
    try {
      const response = await startupAPI.getApplication(applicationId);
      if (response.success) {
        const data = response.data;
        setValues(data);
        setOriginalData(data);
      } else {
        throw new Error(response.message || "Failed to load application");
      }
    } catch (error) {
      console.error("Error loading application:", error);
      setSubmitError(`Failed to load application: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (fieldPath, value) => {
    setValues((prev) => {
      const newValues = { ...prev };
      const keys = fieldPath.split(".");
      let current = newValues;
      keys.forEach((key, idx) => {
        if (idx === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
      return newValues;
    });

    // Clear validation error when user updates the field
    if (validationErrors[fieldPath]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    }
  };

  // Check if a field has an existing document (URL)
  const hasExistingDocument = (fieldPath) => {
    const keys = fieldPath.split(".");
    let current = originalData || {};
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return false;
      }
    }
    return typeof current === "string" && current.startsWith("http");
  };

  // Get the URL of an existing document
  const getDocumentUrl = (fieldPath) => {
    const keys = fieldPath.split(".");
    let current = originalData || {};
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return null;
      }
    }
    return typeof current === "string" && current.startsWith("http")
      ? current
      : null;
  };

  // Comprehensive validation function
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    try {
      // Validate General Details
      if (window.validateGeneralDetails) {
        const generalValid = window.validateGeneralDetails();
        if (!generalValid) {
          errors.generalDetails =
            "Please complete all required general details";
          isValid = false;
        }
      }

      // Validate Innovation Grading
      if (window.validateInnovationGrading) {
        const innovationValid = window.validateInnovationGrading();
        if (!innovationValid) {
          errors.innovationGrading =
            "Please complete all required innovation grading fields";
          isValid = false;
        }
      }

      // Validate Wealth Grading
      if (window.validateWealthGrading) {
        const wealthValid = window.validateWealthGrading();
        if (!wealthValid) {
          errors.wealthGrading =
            "Please complete all required wealth grading fields";
          isValid = false;
        }
      }

      // Validate Employment Creation
      if (window.validateEmploymentCreation) {
        const employmentValid = window.validateEmploymentCreation();
        if (!employmentValid) {
          errors.employmentCreation =
            "Please complete all required employment creation fields";
          isValid = false;
        }
      }

      // Additional custom validations can be added here
      // Example: Check required files
      if (!values.moaFile && !hasExistingDocument("moaFile")) {
        errors.moaFile = "MOA file is required";
        isValid = false;
      }

      if (!values.startupVideoLink || values.startupVideoLink.trim() === "") {
        errors.startupVideoLink = "Startup video link is required";
        isValid = false;
      }
    } catch (error) {
      console.error("Validation error:", error);
      errors.general = "Validation failed. Please check all fields.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate form
    setIsValidating(true);
    const isValid = validateForm();
    setIsValidating(false);

    if (!isValid) {
      setSubmitError("Please complete all required fields before submitting.");

      // Scroll to first error
      setTimeout(() => {
        const errorElement = document.querySelector(
          ".border-red-300, .bg-red-50"
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        `${isEditMode ? "Updating" : "Creating"} application:`,
        values
      );

      let response;
      if (isEditMode) {
        response = await startupAPI.updateApplication(applicationId, values);
      } else {
        response = await startupAPI.submitApplication(values);
      }

      if (response.success) {
        setSubmitSuccess(true);

        const message = isEditMode
          ? `✅ Application updated successfully! Application ID: ${applicationId}`
          : `✅ Application submitted successfully! Application ID: ${response.data.startupId}`;

        alert(message);

        if (!isEditMode) {
          // Reset form only for create mode
          setValues(defaultValues);
          setValidationErrors({});
        }

        // Call onClose if provided (for modal usage)
        if (onClose) {
          onClose(response);
        }
      } else {
        throw new Error(
          response.message || `${isEditMode ? "Update" : "Submission"} failed`
        );
      }
    } catch (error) {
      console.error(`${isEditMode ? "Update" : "Submission"} error:`, error);
      setSubmitError(
        `Failed to ${isEditMode ? "update" : "submit"} application: ${
          error.message
        }`
      );
      alert(
        `❌ ${isEditMode ? "Update" : "Submission"} failed: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching data in edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
              <span className="text-gray-700 font-medium">
                Loading application data...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-8 border border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isEditMode ? "Edit Application" : "Startup Application Form"}
                {isEditMode && applicationId && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    (ID: {applicationId})
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? "Update your application details"
                  : "Complete all sections of your startup application"}
              </p>
            </div>
            {onClose && (
              <button
                onClick={() => onClose()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
            {/* Loading Overlay */}
            {(isValidating || isSubmitting) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="text-gray-700 font-medium">
                    {isValidating
                      ? "Validating form..."
                      : isEditMode
                      ? "Updating application..."
                      : "Uploading files & submitting..."}
                  </span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-400 mr-3">❌</div>
                  <div className="text-red-700 font-medium">{submitError}</div>
                </div>
              </div>
            )}

            {/* Validation Errors Display */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-red-400 mr-3 mt-0.5">⚠️</div>
                  <div>
                    <div className="text-red-700 font-medium mb-2">
                      Please fix the following errors:
                    </div>
                    <ul className="text-red-600 text-sm space-y-1">
                      {Object.entries(validationErrors).map(
                        ([field, error]) => (
                          <li key={field}>• {error}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-400 mr-3">✅</div>
                  <div className="text-green-700 font-medium">
                    Application {isEditMode ? "updated" : "submitted"}{" "}
                    successfully!
                    {!isEditMode &&
                      " Your files have been uploaded to secure storage."}
                  </div>
                </div>
              </div>
            )}

            {/* General Details Section */}
            <div className="mb-12">
              {/* <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  General Details
                </h2>
                <p className="text-gray-600">
                  Provide basic information about your startup
                </p>
              </div> */}
              <GeneralDetailsForm
                data={values}
                onChange={handleChange}
                isValidating={isValidating}
                isEditMode={isEditMode}
                hasExistingDocument={hasExistingDocument}
                getDocumentUrl={getDocumentUrl}
                validationErrors={validationErrors}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-12"></div>

            {/* Broad Parameters Section */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Broad Parameters
                </h2>
                <p className="text-gray-600">
                  Provide detailed grading and assessment information
                </p>
              </div>
              <BroadParameters
                values={values}
                onChange={handleChange}
                isEditMode={isEditMode}
                hasExistingDocument={hasExistingDocument}
                getDocumentUrl={getDocumentUrl}
                validationErrors={validationErrors}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={isValidating || isSubmitting}
                className={`flex items-center px-12 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEditMode
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Validating...
                  </>
                ) : isEditMode ? (
                  <>💾 Update Application</>
                ) : (
                  <>🚀 Submit Application</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
