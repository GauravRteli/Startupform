const StartupApplication = require("../models/StartupApplication");
const { uploadToS3 } = require("../services/fileUploadAWS");

class StartupController {
  constructor(dbConnection) {
    this.startupModel = new StartupApplication(dbConnection);
  }

  processFormData(req) {
    const data = { ...req.body };

    // Parse JSON strings back to objects
    if (data.incomeTaxReturns && typeof data.incomeTaxReturns === "string") {
      data.incomeTaxReturns = JSON.parse(data.incomeTaxReturns);
    }

    if (data.annualAccounts && typeof data.annualAccounts === "string") {
      data.annualAccounts = JSON.parse(data.annualAccounts);
    }

    if (data.innovationGrading && typeof data.innovationGrading === "string") {
      data.innovationGrading = JSON.parse(data.innovationGrading);
    }

    if (data.wealthGrading && typeof data.wealthGrading === "string") {
      data.wealthGrading = JSON.parse(data.wealthGrading);
    }

    if (
      data.employmentCreation &&
      typeof data.employmentCreation === "string"
    ) {
      data.employmentCreation = JSON.parse(data.employmentCreation);
    }

    return data;
  }

  // Update the createApplication method
  async createApplication(req, res) {
    try {
      // Parse form data
      const data = this.processFormData(req);
      const files = req.files;

      // Upload files and get URLs
      const fileUploads = await this.uploadFiles(files, data);

      // Prepare data with file URLs
      const processedData = this.processDataWithFileUrls(data, fileUploads);

      // Save to database
      const result = await this.startupModel.create(processedData);

      res.status(201).json({
        success: true,
        message: "Startup application created successfully",
        data: {
          startupId: result.startupId,
          uploadedFiles: Object.keys(fileUploads).length,
          fileDetails: fileUploads,
        },
      });
    } catch (error) {
      console.error("Error creating startup application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create startup application",
        error: error.message,
      });
    }
  }

  // Updated uploadFiles method in StartupController
  async uploadFiles(files, data, userId = null) {
    const uploadedFiles = {};

    try {
      // Upload individual files with proper extensions
      if (files.moaFile) {
        const result = await uploadToS3(files.moaFile[0], "moa-files", userId);
        uploadedFiles.moaFileUrl = result?.url || null;
        uploadedFiles.moaFileInfo = result;
      }

      if (files.reconstructionFile) {
        const result = await uploadToS3(
          files.reconstructionFile[0],
          "reconstruction-files",
          userId
        );
        uploadedFiles.reconstructionFileUrl = result?.url || null;
        uploadedFiles.reconstructionFileInfo = result;
      }

      // Upload income tax returns with proper extensions
      if (files["incomeTaxReturns.fy2024_25"]) {
        const result = await uploadToS3(
          files["incomeTaxReturns.fy2024_25"][0],
          "tax-returns",
          userId
        );
        uploadedFiles.incomeTax2024_25 = result?.url || null;
      }
      if (files["incomeTaxReturns.fy2023_24"]) {
        const result = await uploadToS3(
          files["incomeTaxReturns.fy2023_24"][0],
          "tax-returns",
          userId
        );
        uploadedFiles.incomeTax2023_24 = result?.url || null;
      }
      if (files["incomeTaxReturns.fy2022_23"]) {
        const result = await uploadToS3(
          files["incomeTaxReturns.fy2022_23"][0],
          "tax-returns",
          userId
        );
        uploadedFiles.incomeTax2022_23 = result?.url || null;
      }

      // Upload annual account documents with proper extensions
      for (let i = 0; i < 3; i++) {
        if (files[`annualAccounts[${i}].balanceSheet`]) {
          const result = await uploadToS3(
            files[`annualAccounts[${i}].balanceSheet`][0],
            "balance-sheets",
            userId
          );
          uploadedFiles[`balanceSheet_${i}`] = result?.url || null;
        }
        if (files[`annualAccounts[${i}].profitLossDoc`]) {
          const result = await uploadToS3(
            files[`annualAccounts[${i}].profitLossDoc`][0],
            "profit-loss",
            userId
          );
          uploadedFiles[`profitLossDoc_${i}`] = result?.url || null;
        }
      }

      // Upload grading documents with proper extensions
      const gradingSections = [
        "innovationGrading",
        "wealthGrading",
        "employmentCreation",
      ];
      for (const section of gradingSections) {
        if (data[section]) {
          for (const [key, value] of Object.entries(data[section])) {
            const fileFieldName = `${section}.${key}.document`;
            if (files[fileFieldName]) {
              const result = await uploadToS3(
                files[fileFieldName][0],
                `${section}-docs`,
                userId
              );
              uploadedFiles[`${section}_${key}_doc`] = result?.url || null;
            }
          }
        }
      }

      return uploadedFiles;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  processDataWithFileUrls(data, fileUploads) {
    const processedData = { ...data };

    // Add main file URLs
    processedData.moaFileUrl = fileUploads.moaFileUrl || null;
    processedData.reconstructionFileUrl =
      fileUploads.reconstructionFileUrl || null;

    // Add income tax return URLs
    processedData.incomeTaxReturns.fy2024_25 =
      fileUploads.incomeTax2024_25 || null;
    processedData.incomeTaxReturns.fy2023_24 =
      fileUploads.incomeTax2023_24 || null;
    processedData.incomeTaxReturns.fy2022_23 =
      fileUploads.incomeTax2022_23 || null;

    // Add annual account document URLs
    processedData.annualAccounts.forEach((account, index) => {
      account.balanceSheetUrl = fileUploads[`balanceSheet_${index}`] || null;
      account.profitLossDocUrl = fileUploads[`profitLossDoc_${index}`] || null;
    });

    // Add grading document URLs
    ["innovationGrading", "wealthGrading", "employmentCreation"].forEach(
      (section) => {
        if (processedData[section]) {
          Object.keys(processedData[section]).forEach((key) => {
            const docKey = `${section}_${key}_doc`;
            if (
              processedData[section][key] &&
              typeof processedData[section][key] === "object"
            ) {
              processedData[section][key].documentUrl =
                fileUploads[docKey] || null;
            }
          });
        }
      }
    );

    return processedData;
  }
  // Add this method to your existing StartupController class
  async getApplication(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
      }

      // Get raw data from database
      const rawData = await this.startupModel.getById(id);

      // Transform data to required format
      const formattedData = this.transformToRequiredFormat(rawData);

      res.status(200).json({
        success: true,
        data: formattedData,
      });
    } catch (error) {
      console.error("Error fetching startup application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch startup application",
        error: error.message,
      });
    }
  }

  // Helper method to transform database data to required format
  transformToRequiredFormat(rawData) {
    const { main, incomeTax, annualAccounts, innovation, wealth, employment } =
      rawData;

    // Helper function to determine if document is required based on value
    const isDocRequired = (value) => {
      const noDocRequiredValues = [
        "NO_FUNDING",
        "NO_REVENUE",
        "LOSS",
        "EMP_LESS_20",
        "PERCENT_0",
      ];
      return !noDocRequiredValues.includes(value);
    };

    // Helper function to format grading object
    const formatGradingItem = (value, label, docUrl) => ({
      value: value || null,
      label: label || null,
      docRequired: isDocRequired(value),
      document: docUrl || null,
    });

    // Format annual accounts to ensure we have 3 years
    const formatAnnualAccounts = () => {
      const years = ["2024-2025", "2023-2024", "2022-2023"];
      const formattedAccounts = [];

      years.forEach((year) => {
        const existingAccount = annualAccounts.find((acc) => acc.year === year);
        if (existingAccount) {
          formattedAccounts.push({
            year: existingAccount.year,
            revenue: parseFloat(existingAccount.revenue) || 0,
            profitLoss: parseFloat(existingAccount.profit_loss) || 0,
            balanceSheet: existingAccount.balance_sheet_url || null,
            profitLossDoc: existingAccount.profit_loss_doc_url || null,
          });
        } else {
          formattedAccounts.push({
            year: year,
            revenue: 0,
            profitLoss: 0,
            balanceSheet: null,
            profitLossDoc: null,
          });
        }
      });

      return formattedAccounts;
    };

    return {
      moaFile: main.moa_file_url || null,
      reconstructionFile: main.reconstruction_file_url || null,
      startupVideoLink: main.startup_video_link || null,
      incomeTaxReturns: {
        fy2024_25: incomeTax.fy2024_25_url || null,
        fy2023_24: incomeTax.fy2023_24_url || null,
        fy2022_23: incomeTax.fy2022_23_url || null,
      },
      annualAccounts: formatAnnualAccounts(),
      innovationGrading: {
        intellectualProperty: formatGradingItem(
          innovation.intellectual_property_value,
          innovation.intellectual_property_label,
          innovation.intellectual_property_doc_url
        ),
        achievementsAwards: formatGradingItem(
          innovation.achievements_awards_value,
          innovation.achievements_awards_label,
          innovation.achievements_awards_doc_url
        ),
        stageOfProductService: formatGradingItem(
          innovation.stage_of_product_value,
          innovation.stage_of_product_label,
          innovation.stage_of_product_doc_url
        ),
        employmentOfResearchPersonnel: formatGradingItem(
          innovation.employment_research_value,
          innovation.employment_research_label,
          innovation.employment_research_doc_url
        ),
      },
      wealthGrading: {
        fundingObtained: formatGradingItem(
          wealth.funding_obtained_value,
          wealth.funding_obtained_label,
          wealth.funding_obtained_doc_url
        ),
        revenueGeneration: formatGradingItem(
          wealth.revenue_generation_value,
          wealth.revenue_generation_label,
          wealth.revenue_generation_doc_url
        ),
        profitability: formatGradingItem(
          wealth.profitability_value,
          wealth.profitability_label,
          wealth.profitability_doc_url
        ),
      },
      employmentCreation: {
        directEmployment: formatGradingItem(
          employment.direct_employment_value,
          employment.direct_employment_label,
          employment.direct_employment_doc_url
        ),
        pwdFemaleEmploymentCount: formatGradingItem(
          employment.pwd_female_employment_value,
          employment.pwd_female_employment_label,
          employment.pwd_female_employment_doc_url
        ),
        employeeNonMetroCities: formatGradingItem(
          employment.employee_non_metro_value,
          employment.employee_non_metro_label,
          employment.employee_non_metro_doc_url
        ),
      },
    };
  }
  // NEW: Get all applications (simple list from single table)
  async getAllApplicationsSimple(req, res) {
    try {
      const { limit = 20, offset = 0, search = "", page = 1 } = req.query;

      // Calculate offset from page if provided
      const calculatedOffset =
        page > 1 ? (parseInt(page) - 1) * parseInt(limit) : parseInt(offset);

      const result = await this.startupModel.getAllSimple(
        parseInt(limit),
        calculatedOffset,
        search
      );

      // Format response for easy consumption
      const response = {
        success: true,
        message: "Applications retrieved successfully",
        data: {
          applications: result.applications.map((app) => ({
            id: app.id,
            startupVideoLink: app.startup_video_link,
            moaFile: app.moa_file_url,
            reconstructionFile: app.reconstruction_file_url,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
          })),
          pagination: {
            total: result.total,
            limit: result.limit,
            offset: result.offset,
            currentPage: Math.floor(result.offset / result.limit) + 1,
            totalPages: Math.ceil(result.total / result.limit),
            hasMore: result.hasMore,
            hasPrevious: result.offset > 0,
          },
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
        error: error.message,
      });
    }
  }
  async updateApplication(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
      }

      // Parse form data
      const data = this.processFormData(req);
      const files = req.files;

      // Get existing application data
      const existingData = await this.startupModel.getById(id);

      // Upload new files and get URLs (only for changed files)
      const fileUploads = await this.uploadFiles(files, data, null);

      // Merge existing URLs with new file URLs, handling null removals
      const processedData = this.mergeExistingWithNewData(
        existingData,
        data,
        fileUploads
      );
      // Update in database
      const result = await this.startupModel.update(id, processedData);

      res.status(200).json({
        success: true,
        message: "Startup application updated successfully",
        data: {
          startupId: id,
          updatedFiles: Object.keys(fileUploads).length,
          fileDetails: fileUploads,
          nullsProcessed: true, // Confirm null handling
        },
      });
    } catch (error) {
      console.error("Error updating startup application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update startup application",
        error: error.message,
      });
    }
  }

  // Add this helper method to handle null values properly
  handleNullValues(data) {
    // Convert null strings to actual null values
    const processValue = (value) => {
      if (
        value === null ||
        value === "null" ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }
      return value;
    };

    // Process all file URLs
    data.moaFileUrl = processValue(data.moaFileUrl);
    data.reconstructionFileUrl = processValue(data.reconstructionFileUrl);

    // Process income tax returns
    if (data.incomeTaxReturns) {
      data.incomeTaxReturns.fy2024_25 = processValue(
        data.incomeTaxReturns.fy2024_25
      );
      data.incomeTaxReturns.fy2023_24 = processValue(
        data.incomeTaxReturns.fy2023_24
      );
      data.incomeTaxReturns.fy2022_23 = processValue(
        data.incomeTaxReturns.fy2022_23
      );
    }

    // Process annual accounts
    if (data.annualAccounts) {
      data.annualAccounts.forEach((account) => {
        account.balanceSheetUrl = processValue(account.balanceSheetUrl);
        account.profitLossDocUrl = processValue(account.profitLossDocUrl);
      });
    }

    // Process grading sections
    ["innovationGrading", "wealthGrading", "employmentCreation"].forEach(
      (section) => {
        if (data[section]) {
          Object.keys(data[section]).forEach((key) => {
            if (data[section][key] && typeof data[section][key] === "object") {
              data[section][key].documentUrl = processValue(
                data[section][key].documentUrl
              );
            }
          });
        }
      }
    );

    return data;
  }

  // Update the mergeExistingWithNewData method
  mergeExistingWithNewData(existingData, newData, fileUploads) {
    const processedData = { ...newData };

    // Handle main files - explicitly check for null from frontend
    processedData.moaFileUrl =
      newData.moaFile === null
        ? null // Frontend sent null to remove
        : fileUploads.moaFileUrl || // New file uploaded
          existingData.main?.moa_file_url ||
          null; // Keep existing

    processedData.reconstructionFileUrl =
      newData.reconstructionFile === null
        ? null // Frontend sent null to remove
        : fileUploads.reconstructionFileUrl || // New file uploaded
          existingData.main?.reconstruction_file_url ||
          null; // Keep existing

    // Handle income tax returns with null support
    if (!processedData.incomeTaxReturns) processedData.incomeTaxReturns = {};

    processedData.incomeTaxReturns.fy2024_25 =
      newData.incomeTaxReturns?.fy2024_25 === null
        ? null
        : fileUploads.incomeTax2024_25 ||
          existingData.incomeTax?.fy2024_25_url ||
          null;

    processedData.incomeTaxReturns.fy2023_24 =
      newData.incomeTaxReturns?.fy2023_24 === null
        ? null
        : fileUploads.incomeTax2023_24 ||
          existingData.incomeTax?.fy2023_24_url ||
          null;

    processedData.incomeTaxReturns.fy2022_23 =
      newData.incomeTaxReturns?.fy2022_23 === null
        ? null
        : fileUploads.incomeTax2022_23 ||
          existingData.incomeTax?.fy2022_23_url ||
          null;

    // Handle annual accounts with null support
    if (processedData.annualAccounts) {
      processedData.annualAccounts.forEach((account, index) => {
        const existingAccount = existingData.annualAccounts?.find(
          (acc) => acc.year === account.year
        );

        // Check if frontend sent null for removal
        account.balanceSheetUrl =
          account.balanceSheet === null
            ? null
            : fileUploads[`balanceSheet_${index}`] ||
              existingAccount?.balance_sheet_url ||
              null;

        account.profitLossDocUrl =
          account.profitLossDoc === null
            ? null
            : fileUploads[`profitLossDoc_${index}`] ||
              existingAccount?.profit_loss_doc_url ||
              null;
      });
    }

    // Handle grading document URLs with null support
    ["innovationGrading", "wealthGrading", "employmentCreation"].forEach(
      (section) => {
        if (processedData[section]) {
          Object.keys(processedData[section]).forEach((key) => {
            const docKey = `${section}_${key}_doc`;
            const existingSection =
              existingData[
                section === "innovationGrading"
                  ? "innovation"
                  : section === "wealthGrading"
                  ? "wealth"
                  : "employment"
              ];

            if (
              processedData[section][key] &&
              typeof processedData[section][key] === "object"
            ) {
              // Check if frontend sent null for removal
              if (processedData[section][key].document === null) {
                processedData[section][key].documentUrl = null;
              } else if (fileUploads[docKey]) {
                processedData[section][key].documentUrl = fileUploads[docKey];
              } else {
                // Preserve existing document URL
                const existingDocUrl = this.getExistingDocumentUrl(
                  existingSection,
                  section,
                  key
                );
                processedData[section][key].documentUrl = existingDocUrl;
              }
            }
          });
        }
      }
    );

    // Apply null value processing
    return this.handleNullValues(processedData);
  }

  // Helper method to get existing document URL from database structure
  getExistingDocumentUrl(existingSection, section, key) {
    if (!existingSection) return null;

    const fieldMappings = {
      innovationGrading: {
        intellectualProperty: "intellectual_property_doc_url",
        achievementsAwards: "achievements_awards_doc_url",
        stageOfProductService: "stage_of_product_doc_url",
        employmentOfResearchPersonnel: "employment_research_doc_url",
      },
      wealthGrading: {
        fundingObtained: "funding_obtained_doc_url",
        revenueGeneration: "revenue_generation_doc_url",
        profitability: "profitability_doc_url",
      },
      employmentCreation: {
        directEmployment: "direct_employment_doc_url",
        pwdFemaleEmploymentCount: "pwd_female_employment_doc_url",
        employeeNonMetroCities: "employee_non_metro_doc_url",
      },
    };

    const dbField = fieldMappings[section]?.[key];
    return dbField ? existingSection[dbField] : null;
  }
}

module.exports = StartupController;
