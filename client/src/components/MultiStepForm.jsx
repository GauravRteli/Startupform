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
  const [originalData, setOriginalData] = useState(null); // Store original data for edit mode
  const [step, setStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Updated steps - removed review step
  const steps = ["General Details", "Broad Parameters"];
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
        setOriginalData(data); // Keep original for comparison
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

  // Enhanced validation for each step
  const validateCurrentStep = async () => {
    setIsValidating(true);
    let isValid = false;
    try {
      if (step === 1) {
        if (window.validateGeneralDetails) {
          isValid = window.validateGeneralDetails();
        } else {
          console.warn("General Details validation function not found");
          isValid = true;
        }
      } else if (step === 2) {
        const innovationValid = window.validateInnovationGrading
          ? window.validateInnovationGrading()
          : true;
        const wealthValid = window.validateWealthGrading
          ? window.validateWealthGrading()
          : true;
        const employmentValid = window.validateEmploymentCreation
          ? window.validateEmploymentCreation()
          : true;
        isValid = innovationValid && wealthValid && employmentValid;
      } else {
        isValid = true;
      }
    } catch (error) {
      console.error("Validation error:", error);
      isValid = false;
    }
    setIsValidating(false);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (step < steps.length) {
        setStep((s) => s + 1);
      }
    } else {
      setTimeout(() => {
        const errorElement = document.querySelector(
          ".border-red-300, .bg-red-50"
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  // Handle submission for both create and edit modes
  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate all steps
    setIsValidating(true);
    const generalValid = window.validateGeneralDetails
      ? window.validateGeneralDetails()
      : true;
    const innovationValid = window.validateInnovationGrading
      ? window.validateInnovationGrading()
      : true;
    const wealthValid = window.validateWealthGrading
      ? window.validateWealthGrading()
      : true;
    const employmentValid = window.validateEmploymentCreation
      ? window.validateEmploymentCreation()
      : true;

    const allValid =
      generalValid && innovationValid && wealthValid && employmentValid;
    setIsValidating(false);

    if (!allValid) {
      setSubmitError("Please complete all required fields before submitting.");
      if (!generalValid) {
        setStep(1);
      } else if (!innovationValid || !wealthValid || !employmentValid) {
        setStep(2);
      }
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
        // Call update API
        response = await startupAPI.updateApplication(applicationId, values);
      } else {
        // Call create API
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
          setStep(1);
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
                  : "Complete your application in 2 simple steps"}
              </p>
            </div>
            {onClose && (
              <button
                onClick={() => onClose()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-10 relative">
            {steps.map((label, index) => (
              <div key={index} className="flex flex-col items-center z-10">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-4 font-semibold transition-all duration-300 ${
                    index + 1 <= step
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {index + 1 <= step ? "✓" : index + 1}
                </div>
                <p
                  className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                    index + 1 === step ? "text-orange-600" : "text-gray-500"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div
                className="h-full bg-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

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

          {/* Step Content */}
          {step === 1 && (
            <GeneralDetailsForm
              data={values}
              onChange={handleChange}
              onNext={handleNext}
              isValidating={isValidating}
              isEditMode={isEditMode}
              hasExistingDocument={hasExistingDocument}
              getDocumentUrl={getDocumentUrl}
            />
          )}

          {step === 2 && (
            <div>
              <BroadParameters
                values={values}
                onChange={handleChange}
                isEditMode={isEditMode}
                hasExistingDocument={hasExistingDocument}
                getDocumentUrl={getDocumentUrl}
              />
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  disabled={isValidating || isSubmitting}
                  className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md disabled:opacity-50"
                >
                  ← Back
                </button>
                {/* Submit button directly in step 2 */}
                <button
                  onClick={handleSubmit}
                  disabled={isValidating || isSubmitting}
                  className={`flex items-center px-8 py-3 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 ${
                    isEditMode
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? "Updating..." : "Submitting..."}
                    </>
                  ) : isValidating ? (
                    "Validating..."
                  ) : isEditMode ? (
                    "💾 Update Application"
                  ) : (
                    "🚀 Submit Application"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
