const express = require("express");
const { upload } = require("../services/fileUploadAWS");
const StartupController = require("../controllers/startupController");

const router = express.Router();

// Define all possible file fields for multer
const fileFields = [
  { name: "moaFile", maxCount: 1 },
  { name: "reconstructionFile", maxCount: 1 },
  { name: "incomeTaxReturns.fy2024_25", maxCount: 1 },
  { name: "incomeTaxReturns.fy2023_24", maxCount: 1 },
  { name: "incomeTaxReturns.fy2022_23", maxCount: 1 },
];

// Add annual account file fields
for (let i = 0; i < 3; i++) {
  fileFields.push(
    { name: `annualAccounts[${i}].balanceSheet`, maxCount: 1 },
    { name: `annualAccounts[${i}].profitLossDoc`, maxCount: 1 }
  );
}

// Add grading document fields
const gradingSections = [
  "innovationGrading",
  "wealthGrading",
  "employmentCreation",
];
const gradingFields = {
  innovationGrading: [
    "intellectualProperty",
    "achievementsAwards",
    "stageOfProductService",
    "employmentOfResearchPersonnel",
  ],
  wealthGrading: ["fundingObtained", "revenueGeneration", "profitability"],
  employmentCreation: [
    "directEmployment",
    "pwdFemaleEmploymentCount",
    "employeeNonMetroCities",
  ],
};

gradingSections.forEach((section) => {
  gradingFields[section].forEach((field) => {
    fileFields.push({ name: `${section}.${field}.document`, maxCount: 1 });
  });
});

// Initialize controller (you'll pass the database connection when setting up routes)
const createStartupRoutes = (dbConnection) => {
  const startupController = new StartupController(dbConnection);

  // POST route for creating startup application
  router.post("/applications", upload.fields(fileFields), (req, res) =>
    startupController.createApplication(req, res)
  );

  router.put("/applications/:id", upload.fields(fileFields), (req, res) =>
    startupController.updateApplication(req, res)
  );

  // GET route for fetching ALL applications (simple list from single table)
  router.get("/applications", (req, res) =>
    startupController.getAllApplicationsSimple(req, res)
  );

  // NEW: GET route for fetching startup application by ID
  router.get("/applications/:id", (req, res) =>
    startupController.getApplication(req, res)
  );

  return router;
};

module.exports = createStartupRoutes;
