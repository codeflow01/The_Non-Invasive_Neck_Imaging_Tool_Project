# The Non-invasive Cardiac Diagnosis Mobile Application 
<!-- <span>&nbsp;&#128249;<span> -->

## Installation

### Prerequisite
Ensure you have the following installed:
- [Node.js](https://nodejs.org/en/)

### Installing Dependencies
Under the project directory, install the dependencies using npm:
```bash
npm install
```

### Create Server Storage Directories
In the server directory, create the necessary directories with the following command:
```bash
mkdir server-fastapi-frames-storage server-fastapi-roiFrames-storage server-fastapi-results-storage server-fastapi-video-storage
```

### Create Server Environment File
In the server directory, create an environment file named .env and add the following environment variables:
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

### Starting the Server Application
In the server directory, start the server application with the following command:<br><br>
Step 1: Activating the Python virtual environment
```bash
source venv/bin/activate
```

remove the 

```bash
venv/Scripts/activate
```

Step 2: Running the FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Quick Start

Scan the Scan the QR code displayed in the terminal. If everything is set up *correctly*, the application should open on your mobile phone.


others need to be added:

1. ip address
2. opencv version / requirements.txt
3. create .env for frontend
