from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from diagnosis_cardiac import video_cardiac_analyze, get_absolute_paths
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path


app = FastAPI()
router = APIRouter()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        # Home
        "http://192.168.1.19:8081",
        # ABI
        "http://172.23.127.183:8081"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "server-fastapi-results-storage")

print(f"(∆π∆)Static directory path: {static_dir}")
print(f"(∆π∆)Static directory exists: {os.path.exists(static_dir)}")
if os.path.exists(static_dir):
    print(f"(∆π∆)Static directory contents: {os.listdir(static_dir)}")

# Mount the existing static directory
app.mount("/server-fastapi-results-storage", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    return {"message": "Python FastAPI server is running!"}


@router.get("/diagnosis/cardiac")
async def diagnose_cardiac():
    try:
        input_folder, _ = get_absolute_paths()
        print(f"(∆π∆)Input folder path: {input_folder}")

        if not os.path.exists(input_folder):
            print(f"(∆π∆)Input folder does not exist: {input_folder}")
            return {"success": False, "message": "Input folder not found"}
   
        video_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.mp4', '.avi', '.mov'))]
        if not video_files:
            return {"success": False, "message": "No video files found"}
        
        if not video_files:
            return {"success": False, "message": "No video files found"}
            
        video_name = Path(video_files[0]).stem
        success = await video_cardiac_analyze()
        
        return {
            "success": success,
            "videoName": video_name
        }
    except Exception as e:
        print(f"Error in diagnosis endpoint: {e}")
        return {"success": False}


# For REST API Testing
@router.get("/api")
async def api_endpoint():
    return {"message": "Connected"}

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
