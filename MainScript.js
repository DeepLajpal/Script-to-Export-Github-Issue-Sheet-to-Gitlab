const axios = require("axios");
const fs = require("fs");
const csv = require("csvtojson");
require('dotenv').config(); // Load environment variables from .env file

// Replace with your details
const PROJECT_ID = process.env.PROJECT_ID; // Replace with your Project ID
const PERSONAL_ACCESS_TOKEN = process.env.PERSONAL_ACCESS_TOKEN; // Replace with your token
const GITLAB_API_URL = `https://gitlab.com/api/v4/projects/${PROJECT_ID}/issues`;

// Axios configuration
const config = {
  headers: {
    "Authorization": `Bearer ${PERSONAL_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  }
};

// Function to create issues
const createIssue = async (issueData) => {
  try {
    const response = await axios.post(GITLAB_API_URL, issueData, config);
    console.log(`Issue "${issueData.title}" created successfully!`);
    console.log("Issue details:", response.data);
  } catch (error) {
    console.error(`Failed to create issue "${issueData.title}".`);
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

// Function to process CSV file and create issues
const processCSV = async (csvFilePath) => {
  try {
    const issues = await csv().fromFile(csvFilePath);

    // Loop through each issue in the JSON array
    for (const issue of issues) {
      const issueData = {
        title: issue.title,
        description: issue.description,
        assignee_ids: issue.assignee_ids ? issue.assignee_ids.split(",").map(Number) : [], // Convert to array of numbers
        labels: issue.labels,
        milestone_id: issue.milestone_id ? Number(issue.milestone_id) : null,
        due_date: issue.due_date,
        confidential: issue.confidential === "true" // Convert string "true"/"false" to boolean
      };

      // Create issue in GitLab
      await createIssue(issueData);
    }
  } catch (error) {
    console.error("Error processing CSV file:", error.message);
  }
};

// Provide the path to your CSV file
const csvFilePath = "./issues.csv"; // Replace with your CSV file path

// Start processing the CSV
processCSV(csvFilePath);
