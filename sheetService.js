import { google } from "googleapis";

// Load the service account key JSON file
const keyFile = "./credentials.json"; // Update this with the path to your credentials JSON file
const sheetId = "1uCojmAySPlWUoVA7c4jv_08gNPvsoMiX8jDoe5hilqM"; // Replace with your Google Sheet ID

// Google Sheets API authentication
const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// Function to fetch data from Google Sheets
export const getSheetData = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1",
  });

  return response.data.values;
};
