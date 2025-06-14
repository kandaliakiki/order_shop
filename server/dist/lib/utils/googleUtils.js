"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageFromDrive = exports.uploadToGoogleDrive = exports.isBase64Image = exports.refreshAccessToken = exports.getOAuth2Client = void 0;
const fs_1 = __importDefault(require("fs"));
const googleapis_1 = require("googleapis");
const readline_1 = __importDefault(require("readline"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.local" });
const stream = require("stream");
// Load Google credentials from JSON file
const credentials = JSON.parse(fs_1.default.readFileSync(process.env.GOOGLE_CREDENTIALS_PATH || "", "utf8"));
const TOKEN_PATH = "token.json"; // Path to store the token
const SCOPES = ["https://www.googleapis.com/auth/drive"];
function getOAuth2Client() {
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Load previously authorized token
    try {
        const token = fs_1.default.readFileSync(TOKEN_PATH, "utf8");
        oAuth2Client.setCredentials(JSON.parse(token));
        // Check if the access token is expired and refresh it
        if (oAuth2Client.credentials && oAuth2Client.credentials.expiry_date) {
            const isExpired = oAuth2Client.credentials.expiry_date <= Date.now();
            if (isExpired) {
                // Call refreshAccessToken without await
                refreshAccessToken(oAuth2Client).catch(console.error);
            }
        }
    }
    catch (err) {
        console.error("Token not found, please authorize the app.");
        // Optionally, you can call getAccessToken here if needed
        getAccessToken(oAuth2Client);
    }
    return oAuth2Client;
}
exports.getOAuth2Client = getOAuth2Client;
// Function to refresh the access token
function refreshAccessToken(oAuth2Client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { credentials } = yield oAuth2Client.refreshAccessToken();
            if (credentials) {
                // Check if token is defined
                oAuth2Client.setCredentials(credentials); // Parse token to match Credentials type
                // Save the new tokens to the file
                fs_1.default.writeFileSync(TOKEN_PATH, JSON.stringify(credentials)); // Save token as string directly
            }
            else {
                throw new Error("Failed to retrieve access token.");
            }
        }
        catch (error) {
            console.error("Error refreshing access token:", error);
        }
    });
}
exports.refreshAccessToken = refreshAccessToken;
function isBase64Image(imageData) {
    const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
    return base64Regex.test(imageData);
}
exports.isBase64Image = isBase64Image;
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        prompt: "consent",
        access_type: "offline",
        scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err)
                return console.error("Error retrieving access token", err);
            oAuth2Client.setCredentials(token);
            fs_1.default.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err)
                    return console.error(err);
                console.log("Token stored to", TOKEN_PATH);
            });
        });
    });
}
// Function to upload image to Google Drive
const uploadToGoogleDrive = (base64Image, oAuth2Client, type) => __awaiter(void 0, void 0, void 0, function* () {
    const drive = googleapis_1.google.drive({ version: "v3", auth: oAuth2Client });
    const buffer = Buffer.from(base64Image.split(",")[1], "base64"); // Decode base64 image
    const fileMetadata = {
        name: `${type}_image.png`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID].filter(Boolean), // Ensure no undefined values
    };
    const media = {
        mimeType: "image/png",
        body: new stream.PassThrough().end(buffer),
    };
    const response = yield drive.files.create({
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
    yield drive.permissions.create({
        fileId: response.data.id, // Cast to string to satisfy TypeScript
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });
    return response.data.id; // Return the file ID
});
exports.uploadToGoogleDrive = uploadToGoogleDrive;
// Function to delete an image from Google Drive
const deleteImageFromDrive = (url, oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the file ID from the URL
    const fileId = url.split("id=")[1];
    // Create a Google Drive service instance
    const drive = googleapis_1.google.drive({ version: "v3", auth: oAuth2Client });
    try {
        // Delete the file
        yield drive.files.delete({ fileId });
        console.log("File deleted successfully.");
    }
    catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Failed to delete file from Google Drive");
    }
});
exports.deleteImageFromDrive = deleteImageFromDrive;
