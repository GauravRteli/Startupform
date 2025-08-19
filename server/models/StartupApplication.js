const mysql = require("mysql2/promise");

class StartupApplication {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async create(data) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Insert main application
      const [mainResult] = await connection.execute(
        `INSERT INTO startup_applications (startup_video_link, moa_file_url, reconstruction_file_url) 
                 VALUES (?, ?, ?)`,
        [data.startupVideoLink, data.moaFileUrl, data.reconstructionFileUrl]
      );

      const startupId = mainResult.insertId;

      // Insert income tax returns
      await connection.execute(
        `INSERT INTO income_tax_returns (startup_application_id, fy2024_25_url, fy2023_24_url, fy2022_23_url) 
                 VALUES (?, ?, ?, ?)`,
        [
          startupId,
          data.incomeTaxReturns.fy2024_25,
          data.incomeTaxReturns.fy2023_24,
          data.incomeTaxReturns.fy2022_23,
        ]
      );

      // Insert annual accounts
      for (const account of data.annualAccounts) {
        await connection.execute(
          `INSERT INTO annual_accounts (startup_application_id, year, revenue, profit_loss, balance_sheet_url, profit_loss_doc_url) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [
            startupId,
            account.year,
            account.revenue,
            account.profitLoss,
            account.balanceSheetUrl,
            account.profitLossDocUrl,
          ]
        );
      }

      // Insert innovation grading
      const innovation = data.innovationGrading;
      await connection.execute(
        `INSERT INTO innovation_grading 
                 (startup_application_id, intellectual_property_value, intellectual_property_label, intellectual_property_doc_url,
                  achievements_awards_value, achievements_awards_label, achievements_awards_doc_url,
                  stage_of_product_value, stage_of_product_label, stage_of_product_doc_url,
                  employment_research_value, employment_research_label, employment_research_doc_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          startupId,
          innovation.intellectualProperty.value,
          innovation.intellectualProperty.label,
          innovation.intellectualProperty.documentUrl,
          innovation.achievementsAwards.value,
          innovation.achievementsAwards.label,
          innovation.achievementsAwards.documentUrl,
          innovation.stageOfProductService.value,
          innovation.stageOfProductService.label,
          innovation.stageOfProductService.documentUrl,
          innovation.employmentOfResearchPersonnel.value,
          innovation.employmentOfResearchPersonnel.label,
          innovation.employmentOfResearchPersonnel.documentUrl,
        ]
      );

      // Insert wealth grading
      const wealth = data.wealthGrading;
      await connection.execute(
        `INSERT INTO wealth_grading 
                 (startup_application_id, funding_obtained_value, funding_obtained_label, funding_obtained_doc_url,
                  revenue_generation_value, revenue_generation_label, revenue_generation_doc_url,
                  profitability_value, profitability_label, profitability_doc_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          startupId,
          wealth.fundingObtained.value,
          wealth.fundingObtained.label,
          wealth.fundingObtained.documentUrl,
          wealth.revenueGeneration.value,
          wealth.revenueGeneration.label,
          wealth.revenueGeneration.documentUrl,
          wealth.profitability.value,
          wealth.profitability.label,
          wealth.profitability.documentUrl,
        ]
      );

      // Insert employment creation
      const employment = data.employmentCreation;
      await connection.execute(
        `INSERT INTO employment_creation 
                 (startup_application_id, direct_employment_value, direct_employment_label, direct_employment_doc_url,
                  pwd_female_employment_value, pwd_female_employment_label, pwd_female_employment_doc_url,
                  employee_non_metro_value, employee_non_metro_label, employee_non_metro_doc_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          startupId,
          employment.directEmployment.value,
          employment.directEmployment.label,
          employment.directEmployment.documentUrl,
          employment.pwdFemaleEmploymentCount.value,
          employment.pwdFemaleEmploymentCount.label,
          employment.pwdFemaleEmploymentCount.documentUrl,
          employment.employeeNonMetroCities.value,
          employment.employeeNonMetroCities.label,
          employment.employeeNonMetroCities.documentUrl,
        ]
      );

      await connection.commit();
      return { success: true, startupId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  // Add this method to your existing StartupApplication class
  async getById(startupId) {
    const connection = await this.db.getConnection();

    try {
      // Get main application data
      const [mainRows] = await connection.execute(
        `SELECT startup_video_link, moa_file_url, reconstruction_file_url 
       FROM startup_applications 
       WHERE id = ?`,
        [startupId]
      );

      if (mainRows.length === 0) {
        throw new Error("Startup application not found");
      }

      const mainData = mainRows[0];

      // Get income tax returns
      const [taxRows] = await connection.execute(
        `SELECT fy2024_25_url, fy2023_24_url, fy2022_23_url 
       FROM income_tax_returns 
       WHERE startup_application_id = ?`,
        [startupId]
      );

      // Get annual accounts
      const [accountRows] = await connection.execute(
        `SELECT year, revenue, profit_loss, balance_sheet_url, profit_loss_doc_url 
       FROM annual_accounts 
       WHERE startup_application_id = ? 
       ORDER BY year DESC`,
        [startupId]
      );

      // Get innovation grading
      const [innovationRows] = await connection.execute(
        `SELECT intellectual_property_value, intellectual_property_label, intellectual_property_doc_url,
              achievements_awards_value, achievements_awards_label, achievements_awards_doc_url,
              stage_of_product_value, stage_of_product_label, stage_of_product_doc_url,
              employment_research_value, employment_research_label, employment_research_doc_url
       FROM innovation_grading 
       WHERE startup_application_id = ?`,
        [startupId]
      );

      // Get wealth grading
      const [wealthRows] = await connection.execute(
        `SELECT funding_obtained_value, funding_obtained_label, funding_obtained_doc_url,
              revenue_generation_value, revenue_generation_label, revenue_generation_doc_url,
              profitability_value, profitability_label, profitability_doc_url
       FROM wealth_grading 
       WHERE startup_application_id = ?`,
        [startupId]
      );

      // Get employment creation
      const [employmentRows] = await connection.execute(
        `SELECT direct_employment_value, direct_employment_label, direct_employment_doc_url,
              pwd_female_employment_value, pwd_female_employment_label, pwd_female_employment_doc_url,
              employee_non_metro_value, employee_non_metro_label, employee_non_metro_doc_url
       FROM employment_creation 
       WHERE startup_application_id = ?`,
        [startupId]
      );

      return {
        main: mainData,
        incomeTax: taxRows[0] || {},
        annualAccounts: accountRows,
        innovation: innovationRows[0] || {},
        wealth: wealthRows[0] || {},
        employment: employmentRows[0] || {},
      };
    } finally {
      connection.release();
    }
  }

  // NEW: Get all applications from single table only
  // Update this method in your StartupApplication model
  async getAllSimple(limit = 20, offset = 0, search = "") {
    const connection = await this.db.getConnection();

    try {
      let query = `
      SELECT 
        id,
        startup_video_link,
        moa_file_url,
        reconstruction_file_url,
        created_at,
        updated_at
      FROM startup_applications
    `;

      let queryParams = [];

      // Add search functionality if search term provided
      if (search && search.trim()) {
        query += ` WHERE startup_video_link LIKE ? `;
        queryParams.push(`%${search.trim()}%`);
      }

      // IMPORTANT: Ensure parameters are integers
      const limitInt = parseInt(limit) || 20;
      const offsetInt = parseInt(offset) || 0;

      query += ` ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

      // Execute main query
      const [rows] = await connection.execute(query, queryParams);

      // Get total count with proper parameter handling
      let countQuery = `SELECT COUNT(*) as total FROM startup_applications`;
      let countParams = [];

      if (search && search.trim()) {
        countQuery += ` WHERE startup_video_link LIKE ?`;
        countParams.push(`%${search.trim()}%`);
      }

      const [countResult] = await connection.execute(countQuery, countParams);

      return {
        applications: rows,
        total: countResult[0].total,
        limit: limitInt,
        offset: offsetInt,
        hasMore: offsetInt + limitInt < countResult[0].total,
      };
    } finally {
      connection.release();
    }
  }
  // Update the update method in StartupApplication class
  async update(startupId, data) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Update main application - explicitly handle nulls
      await connection.execute(
        `UPDATE startup_applications 
       SET startup_video_link = ?, moa_file_url = ?, reconstruction_file_url = ?, updated_at = NOW()
       WHERE id = ?`,
        [
          data.startupVideoLink || null,
          data.moaFileUrl, // This can be null
          data.reconstructionFileUrl, // This can be null
          startupId,
        ]
      );

      // Update income tax returns - explicitly handle nulls
      await connection.execute(
        `UPDATE income_tax_returns 
       SET fy2024_25_url = ?, fy2023_24_url = ?, fy2022_23_url = ?
       WHERE startup_application_id = ?`,
        [
          data.incomeTaxReturns.fy2024_25, // Can be null
          data.incomeTaxReturns.fy2023_24, // Can be null
          data.incomeTaxReturns.fy2022_23, // Can be null
          startupId,
        ]
      );

      // Update annual accounts - delete existing and insert new
      await connection.execute(
        `DELETE FROM annual_accounts WHERE startup_application_id = ?`,
        [startupId]
      );

      for (const account of data.annualAccounts) {
        await connection.execute(
          `INSERT INTO annual_accounts (startup_application_id, year, revenue, profit_loss, balance_sheet_url, profit_loss_doc_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            startupId,
            account.year,
            account.revenue,
            account.profitLoss,
            account.balanceSheetUrl, // Can be null
            account.profitLossDocUrl, // Can be null
          ]
        );
      }

      // Helper function to safely get nested values
      const safeGet = (obj, path, defaultValue = null) => {
        return path
          .split(".")
          .reduce(
            (current, key) =>
              current && current[key] !== undefined
                ? current[key]
                : defaultValue,
            obj
          );
      };

      // Update innovation grading with null safety
      const innovation = data.innovationGrading;
      await connection.execute(
        `UPDATE innovation_grading 
       SET intellectual_property_value = ?, intellectual_property_label = ?, intellectual_property_doc_url = ?,
           achievements_awards_value = ?, achievements_awards_label = ?, achievements_awards_doc_url = ?,
           stage_of_product_value = ?, stage_of_product_label = ?, stage_of_product_doc_url = ?,
           employment_research_value = ?, employment_research_label = ?, employment_research_doc_url = ?
       WHERE startup_application_id = ?`,
        [
          safeGet(innovation, "intellectualProperty.value"),
          safeGet(innovation, "intellectualProperty.label"),
          safeGet(innovation, "intellectualProperty.documentUrl"), // Can be null
          safeGet(innovation, "achievementsAwards.value"),
          safeGet(innovation, "achievementsAwards.label"),
          safeGet(innovation, "achievementsAwards.documentUrl"), // Can be null
          safeGet(innovation, "stageOfProductService.value"),
          safeGet(innovation, "stageOfProductService.label"),
          safeGet(innovation, "stageOfProductService.documentUrl"), // Can be null
          safeGet(innovation, "employmentOfResearchPersonnel.value"),
          safeGet(innovation, "employmentOfResearchPersonnel.label"),
          safeGet(innovation, "employmentOfResearchPersonnel.documentUrl"), // Can be null
          startupId,
        ]
      );

      // Update wealth grading with null safety
      const wealth = data.wealthGrading;
      await connection.execute(
        `UPDATE wealth_grading 
       SET funding_obtained_value = ?, funding_obtained_label = ?, funding_obtained_doc_url = ?,
           revenue_generation_value = ?, revenue_generation_label = ?, revenue_generation_doc_url = ?,
           profitability_value = ?, profitability_label = ?, profitability_doc_url = ?
       WHERE startup_application_id = ?`,
        [
          safeGet(wealth, "fundingObtained.value"),
          safeGet(wealth, "fundingObtained.label"),
          safeGet(wealth, "fundingObtained.documentUrl"), // Can be null
          safeGet(wealth, "revenueGeneration.value"),
          safeGet(wealth, "revenueGeneration.label"),
          safeGet(wealth, "revenueGeneration.documentUrl"), // Can be null
          safeGet(wealth, "profitability.value"),
          safeGet(wealth, "profitability.label"),
          safeGet(wealth, "profitability.documentUrl"), // Can be null
          startupId,
        ]
      );

      // Update employment creation with null safety
      const employment = data.employmentCreation;
      await connection.execute(
        `UPDATE employment_creation 
       SET direct_employment_value = ?, direct_employment_label = ?, direct_employment_doc_url = ?,
           pwd_female_employment_value = ?, pwd_female_employment_label = ?, pwd_female_employment_doc_url = ?,
           employee_non_metro_value = ?, employee_non_metro_label = ?, employee_non_metro_doc_url = ?
       WHERE startup_application_id = ?`,
        [
          safeGet(employment, "directEmployment.value"),
          safeGet(employment, "directEmployment.label"),
          safeGet(employment, "directEmployment.documentUrl"), // Can be null
          safeGet(employment, "pwdFemaleEmploymentCount.value"),
          safeGet(employment, "pwdFemaleEmploymentCount.label"),
          safeGet(employment, "pwdFemaleEmploymentCount.documentUrl"), // Can be null
          safeGet(employment, "employeeNonMetroCities.value"),
          safeGet(employment, "employeeNonMetroCities.label"),
          safeGet(employment, "employeeNonMetroCities.documentUrl"), // Can be null
          startupId,
        ]
      );

      await connection.commit();
      return { success: true, startupId };
    } catch (error) {
      await connection.rollback();
      console.error("Database update error:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = StartupApplication;
