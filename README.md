# The Non-invasive Cardiac Diagnosis Mobile Application 
<!-- <span>&nbsp;&#128249;<span> -->
<img alt="Python" src="https://img.shields.io/badge/Python-3.12-4630EB?style=flat-square&labelColor=000000" /> <img alt="Typescript" src="https://img.shields.io/badge/TypeScript-5.3-4630EB?style=flat-square&labelColor=000000" /> <img alt="Expo SDK version" src="https://img.shields.io/npm/v/expo.svg?style=flat-square&label=Expo%20SDK&labelColor=000000&color=4630EB" />

## Installation

### Prerequisite
Ensure you have the following installed:
- [Node.js](https://nodejs.org/en/)

### Installing Dependencies
In the project directory, install the dependencies using npm:
```bash
npm install
```

### Create Server Storage Directories
In the server directory, create the necessary directories with the following command:<br><br>
**_For Mac Users:_**
```bash
mkdir server-fastapi-frames-storage server-fastapi-roiFrames-storage server-fastapi-results-storage server-fastapi-video-storage
```
**_For Windows Users:_**
```bash
mkdir "server-fastapi-frames-storage", "server-fastapi-roiFrames-storage", "server-fastapi-results-storage", "server-fastapi-video-storage"
```
### Create Server Environment File
In the server directory, create an environment file named .env with the following command:<br><br>
**_For Mac Users:_**
```bash
touch .env
```
**_For Windows Users:_**
```bash
ni .env
```
After creating the .env file, open it and add the following environment variables:
```bash
HOST = 0.0.0.0
PORT = 8000
ALLOWED_ORIGINS == [
        "http://localhost:8081",
        # the IP address running the frontend application
        "http://172.23.117.43:8081"
        ]
```

### Starting the Frontend Application 
After installing the dependencies, start the frontend application with the following command:
```bash
npx expo start
```
> Note: Look for the IP address shown in your terminal. It should look like this: `exp://...`. Change the `SERVER_URL` in the following files: `app/(tabs)/imaging/camera.tsx`,`app/(tabs)/imaging/picker.tsx`, `app/(tabs)/imaging/roi.tsx`,`app/(tabs)/index.tsx`,`app/(tabs)/insight.tsx` 

### Starting the Server Application
In the server directory, start the server application with the following command:<br><br>
**_For Mac Users:_**
<br><br>
Step 1: Activating the Python virtual environment
```bash
source venv/bin/activate
```
Step 2: Running the FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**_For Windows Users:_**
<br><br>
Step 1: Remove the existing virtual environment:
```bash
Remove-Item -Path "venv" -Recurse -Force
```
Step 2: Create a new virtual environment:
```bash
python -m venv venv
```
Step 3: Activating the Python virtual environment
```bash
venv/Scripts/activate
```
Step 4: Installing the required packages referenced in the requirements.txt
<br>
Step 5: Running the FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

<br>

## Quickstart

Scan the Scan the QR code displayed in the terminal. If everything is set up *correctly*, the application should open on your mobile phone.
> Note: The QR code is displayed in the terminal after starting the frontend application via `npx expo start`.
