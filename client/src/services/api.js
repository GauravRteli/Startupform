const API_BASE_URL = process.env.REACT_APP_API_URL;
console.log(API_BASE_URL);

class StartupAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to create FormData from your form values
  createFormData(values, isUpdate = false) {
    const formData = new FormData();

    // Add simple text fields
    if (values.startupVideoLink) {
      formData.append("startupVideoLink", values.startupVideoLink);
    }

    // Add JSON data for nested objects (will be parsed on backend)
    formData.append(
      "incomeTaxReturns",
      JSON.stringify(values.incomeTaxReturns)
    );
    formData.append("annualAccounts", JSON.stringify(values.annualAccounts));
    formData.append(
      "innovationGrading",
      JSON.stringify(values.innovationGrading)
    );
    formData.append("wealthGrading", JSON.stringify(values.wealthGrading));
    formData.append(
      "employmentCreation",
      JSON.stringify(values.employmentCreation)
    );

    // Add main document files (handle both File objects and URLs)
    if (values.moaFile instanceof File) {
      formData.append("moaFile", values.moaFile);
    } else if (isUpdate && typeof values.moaFile === "string") {
      // In update mode, if it's a URL string, include it in the JSON data
      // The backend will know to keep the existing file
      formData.append("existingMoaFile", values.moaFile);
    }

    if (values.reconstructionFile instanceof File) {
      formData.append("reconstructionFile", values.reconstructionFile);
    } else if (isUpdate && typeof values.reconstructionFile === "string") {
      formData.append("existingReconstructionFile", values.reconstructionFile);
    }

    // Add income tax return files (handle both File objects and URLs)
    if (values.incomeTaxReturns.fy2024_25 instanceof File) {
      formData.append(
        "incomeTaxReturns.fy2024_25",
        values.incomeTaxReturns.fy2024_25
      );
    }
    if (values.incomeTaxReturns.fy2023_24 instanceof File) {
      formData.append(
        "incomeTaxReturns.fy2023_24",
        values.incomeTaxReturns.fy2023_24
      );
    }
    if (values.incomeTaxReturns.fy2022_23 instanceof File) {
      formData.append(
        "incomeTaxReturns.fy2022_23",
        values.incomeTaxReturns.fy2022_23
      );
    }

    // Add annual account files (handle both File objects and URLs)
    values.annualAccounts.forEach((account, index) => {
      if (account.balanceSheet instanceof File) {
        formData.append(
          `annualAccounts[${index}].balanceSheet`,
          account.balanceSheet
        );
      }
      if (account.profitLossDoc instanceof File) {
        formData.append(
          `annualAccounts[${index}].profitLossDoc`,
          account.profitLossDoc
        );
      }
    });

    // Add innovation grading documents (handle both File objects and URLs)
    if (values.innovationGrading) {
      Object.keys(values.innovationGrading).forEach((key) => {
        const item = values.innovationGrading[key];
        if (item?.document instanceof File) {
          formData.append(`innovationGrading.${key}.document`, item.document);
        }
        // In update mode, existing URLs are preserved in the JSON data
      });
    }

    // Add wealth grading documents (handle both File objects and URLs)
    if (values.wealthGrading) {
      Object.keys(values.wealthGrading).forEach((key) => {
        const item = values.wealthGrading[key];
        if (item?.document instanceof File) {
          formData.append(`wealthGrading.${key}.document`, item.document);
        }
      });
    }

    // Add employment creation documents (handle both File objects and URLs)
    if (values.employmentCreation) {
      Object.keys(values.employmentCreation).forEach((key) => {
        const item = values.employmentCreation[key];
        if (item?.document instanceof File) {
          formData.append(`employmentCreation.${key}.document`, item.document);
        }
      });
    }

    return formData;
  }

  // Submit complete startup application (CREATE)
  async submitApplication(values) {
    try {
      const formData = this.createFormData(values, false);

      const response = await fetch(`${this.baseURL}/startup/applications`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to submit application: ${error.message}`);
    }
  }

  // Update existing startup application (UPDATE)
  async updateApplication(applicationId, values) {
    try {
      const formData = this.createFormData(values, true);

      const response = await fetch(
        `${this.baseURL}/startup/applications/${applicationId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }

  // Get single application by ID (READ)
  async getApplication(applicationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/startup/applications/${applicationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("Application not found");
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch application: ${error.message}`);
    }
  }

  // Get all applications with pagination and search (READ ALL)
  async getAllApplications(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        limit: params.limit || 20,
        offset: params.offset || 0,
        page: params.page || 1,
        search: params.search || "",
      });

      // Remove empty parameters
      for (let [key, value] of queryParams.entries()) {
        if (!value || value === "0") {
          queryParams.delete(key);
        }
      }

      const queryString = queryParams.toString();
      const url = `${this.baseURL}/startup/applications${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }
  }

  // Delete application (DELETE)
  async deleteApplication(applicationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/startup/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("Application not found");
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }

  // Upload single file (for progressive uploads or file replacement)
  async uploadSingleFile(file, fileType = "documents", applicationId = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);

      if (applicationId) {
        formData.append("applicationId", applicationId);
      }

      const response = await fetch(`${this.baseURL}/startup/upload-file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Utility method to check if a value is a file
  isFile(value) {
    return value instanceof File;
  }

  // Utility method to check if a value is a URL
  isUrl(value) {
    return (
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"))
    );
  }

  // Helper method to get file name from URL
  getFileNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split("/").pop() || "document";
    } catch {
      return "document";
    }
  }

  // Helper method to format file size
  formatFileSize(bytes) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Helper method for error handling with retry logic
  async withRetry(apiCall, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }
}

// Create singleton instance
const startupAPI = new StartupAPI();

export default startupAPI;

// Named exports for specific functions
export const {
  submitApplication,
  updateApplication,
  getApplication,
  getAllApplications,
  deleteApplication,
  uploadSingleFile,
  isFile,
  isUrl,
  getFileNameFromUrl,
  formatFileSize,
  withRetry,
  healthCheck,
} = startupAPI;

// Additional utility exports
export const apiUtils = {
  isFile: startupAPI.isFile.bind(startupAPI),
  isUrl: startupAPI.isUrl.bind(startupAPI),
  getFileNameFromUrl: startupAPI.getFileNameFromUrl.bind(startupAPI),
  formatFileSize: startupAPI.formatFileSize.bind(startupAPI),
};
