import fs from "fs";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client
import readline from "readline";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const stream = require("stream");

// Load Google credentials from JSON file
const credentials = JSON.parse(
  fs.readFileSync(process.env.GOOGLE_CREDENTIALS_PATH || "", "utf8")
);

const TOKEN_PATH = "token.json"; // Path to store the token
const SCOPES = ["https://www.googleapis.com/auth/drive"];

export function getOAuth2Client(): OAuth2Client {
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;

  const oAuth2Client: OAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Load previously authorized token
  try {
    const token = fs.readFileSync(TOKEN_PATH, "utf8");
    oAuth2Client.setCredentials(JSON.parse(token));
    // Check if the access token is expired and refresh it
    if (oAuth2Client.credentials && oAuth2Client.credentials.expiry_date) {
      const isExpired = oAuth2Client.credentials.expiry_date <= Date.now();
      if (isExpired) {
        // Call refreshAccessToken without await
        refreshAccessToken(oAuth2Client).catch(console.error);
      }
    }
  } catch (err) {
    console.error("Token not found, please authorize the app.");
    // Optionally, you can call getAccessToken here if needed
    getAccessToken(oAuth2Client);
  }

  return oAuth2Client;
}

// Function to refresh the access token
export async function refreshAccessToken(oAuth2Client: OAuth2Client) {
  try {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    if (credentials) {
      // Check if token is defined
      oAuth2Client.setCredentials(credentials); // Parse token to match Credentials type
      // Save the new tokens to the file
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials)); // Save token as string directly
    } else {
      throw new Error("Failed to retrieve access token.");
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

function getAccessToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    prompt: "consent",
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code: string) => {
    rl.close();
    oAuth2Client.getToken(code, (err: Error | null, token?: any) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token!);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
}

// Function to upload image to Google Drive
export const uploadToGoogleDrive = async (
  base64Image: string,
  oAuth2Client: OAuth2Client,
  type: string
) => {
  const drive = google.drive({ version: "v3", auth: oAuth2Client });
  const buffer = Buffer.from(base64Image.split(",")[1], "base64"); // Decode base64 image
  const fileMetadata = {
    name: `${type}_image.png`,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID].filter(Boolean) as string[], // Ensure no undefined values
  };
  const media = {
    mimeType: "image/png",
    body: new stream.PassThrough().end(buffer),
  };

  const response = await drive.files.create({
    auth: oAuth2Client,
    requestBody: fileMetadata, // Correct property name is 'resource'
    media: media,
    uploadType: "media",
    fields: "id",
  });

  // Ensure response.data.id is a valid string before proceeding
  if (!response.data.id) {
    throw new Error("File ID is not available.");
  }

  await drive.permissions.create({
    fileId: response.data.id as string, // Cast to string to satisfy TypeScript
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return response.data.id; // Return the file ID
};

// Function to delete an image from Google Drive
export const deleteImageFromDrive = async (url: string, oAuth2Client: any) => {
  // Extract the file ID from the URL
  const fileId = url.split("id=")[1];

  // Create a Google Drive service instance
  const drive = google.drive({ version: "v3", auth: oAuth2Client });

  try {
    // Delete the file
    await drive.files.delete({ fileId });
    console.log("File deleted successfully.");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file from Google Drive");
  }
};
