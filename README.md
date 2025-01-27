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
Step 2: Running the FastAPI server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Quick Start

Scan the Scan the QR code displayed in the terminal. If everything is set up *correctly*, the application should open on your mobile phone.
