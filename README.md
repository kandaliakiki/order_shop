# Order Shop - POS System Starter

## Overview

Order Shop is a basic Point of Sale (POS) system starter template that provides essential e-commerce functionality. It's built using Next.js for the client-side and Express.js for the server-side. The application integrates with Google Drive for image storage and uses MongoDB for data persistence.

## Features

- **Basic POS System**: Manage products, categories, and orders
- **Product & Category Management**: Add, update, and delete products and categories with image support
- **Google Drive Integration**: Securely upload and manage images through Google Drive API
- **Responsive UI**: Optimized design for desktop and mobile access using Tailwind CSS
- **Cart System**: Basic shopping cart functionality
- **Order Management**: Track and manage customer orders

## Demo Video

[![Order Shop Demo](https://img.youtube.com/vi/jE6n3H6qdDg/0.jpg)](https://www.youtube.com/watch?v=jE6n3H6qdDg)

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Express.js, MongoDB
- **Image Storage**: Google Drive API with OAuth2
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Installation Guide

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Google Cloud account
- Code editor (VS Code recommended)

### Step 1: Clone and Install

1. Download and extract the source code
2. Open terminal in the project root directory
3. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Environment Setup

#### Server Environment Variables

Create a `.env.local` file in the `server` directory with the following variables:

```env
PORT=your_port_number
MONGODB_URL=your_mongodb_connection_string
GOOGLE_CREDENTIALS_PATH=path_to_your_google_credentials.json
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
```

#### Client Environment Variables

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_BACKEND_ENDPOINT=http://your_domain_or_ip:your_port_number
```

Note: Make sure the port number matches between server and client environment variables.

### Step 3: Google Drive Setup

1. **Create Google Cloud Project**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Drive API
   - Go to "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web Application" (not Desktop Application)
   - Add these Authorized redirect URIs:
     - `http://localhost:3000/` (for client)
     - `http://localhost:8080/` (for server)
   - Download the credentials JSON file
   - Rename it to `client_secret.json`
   - Place one copy in the `server` directory
   - Place another copy in the `client` directory

2. **Setup Google Drive Folder**:

   - Create a new folder in your Google Drive
   - Right-click the folder and select "Share"
   - Make it accessible to anyone with the link
   - Copy the folder ID from the URL (it's the long string after /folders/)

3. **Configure Credentials**:

   - Update the `GOOGLE_CREDENTIALS_PATH` in your server `.env.local` file to point to the server's `client_secret.json`
   - Update the `GOOGLE_DRIVE_FOLDER_ID` with your folder ID

4. **Google Authentication Setup**:
   - If your Google Cloud project is in testing mode:
     - Add your email to the test users list in Google Cloud Console
     - You can only authenticate with the added test email
   - Start the server for the first time
   - You will be prompted with a Google authentication URL
   - Open the URL in your browser
   - Log in with your Google account (must be a test user if in testing mode)
   - Copy the authorization code from the returned URL
   - Paste the code back in the terminal
   - A `token.json` file will be created in your server directory
   - If you get an `invalid_grant` error in testing mode:
     1. Delete the `token.json` file
     2. Restart the server
     3. Follow the authentication process again
   - If your project is published:
     - Any Google account can authenticate
     - No need to re-authenticate unless you revoke access

### Step 4: Database Setup

1. Create a MongoDB database (local or cloud)
2. Get your MongoDB connection string
3. Update the `MONGODB_URL` in your server `.env.local` file

### Step 5: Running the Application

1. **Start the server**:

```bash
cd server
npm start
```

2. **Start the client**:

```bash
cd client
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:your_port_number

### Development Notes

- After making changes to server code (`.ts` files), you need to compile TypeScript:
  ```bash
  cd server
  tsc
  ```
- Then restart the server for changes to take effect
- Client-side changes will automatically recompile due to Next.js hot reloading

## Deployment

To deploy the application:

1. Set up a VPS with Node.js installed
2. Update the environment variables with your domain/IP and port
3. For production client build:
   ```bash
   cd client
   npm run build
   npm start
   ```
4. For server:
   ```bash
   cd server
   npm start
   ```

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Google Drive API](https://developers.google.com/drive)
