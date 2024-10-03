const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(cors());

// Load the service account key JSON file
const keyFile = "./credentials.json"; // Update this with the path to your credentials JSON file
const sheetId = "1uCojmAySPlWUoVA7c4jv_08gNPvsoMiX8jDoe5hilqM"; // Replace with your Google Sheet ID

// Google Sheets API authentication
const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// Transform the raw sheet data into an array of objects
const transformSheetData = (data) => {
  const [headers, ...rows] = data; // Destructure to get headers and rows
  return rows.map((row) => {
    // Create an object for each row
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index]; // Map header to corresponding cell value
    });
    return obj; // Return the object representing the row
  });
};

// Function to fetch data from Google Sheets
const getSheetData = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1", // Update range as needed
  });

  return response.data.values;
};

let cachedData = [];

// Function to refresh data and cache it
const refreshSheetData = async () => {
  try {
    const data = await getSheetData();
    cachedData = transformSheetData(data) || [];
    console.log("Google Sheets data refreshed.");
  } catch (error) {
    console.error("Error refreshing Google Sheets data:", error);
  }
};

// Initial data fetch
refreshSheetData();

// Set an interval to refresh data every 60 seconds
setInterval(refreshSheetData, 60000);

// Endpoint to return cached data
app.get("/detailsFromGoogleSheet", (req, res) => {
  if (cachedData.length === 0) {
    return res.status(500).json({ message: "No data available" });
  }
  res.status(200).send(cachedData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
