from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from diagnosis_cardiac import video_cardiac_analyze
from fastapi.staticfiles import StaticFiles
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
import cv2


load_dotenv()
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")


app = FastAPI()
router = APIRouter()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Get current directory and setup storage paths
current_dir = os.path.dirname(os.path.abspath(__file__))

roi_frames_storage = os.path.join(current_dir, "server-fastapi-roiFrames-storage")
frames_storage = os.path.join(current_dir, "server-fastapi-frames-storage")
results_storage = os.path.join(current_dir, "server-fastapi-results-storage")
video_storage = os.path.join(current_dir, "server-fastapi-video-storage")

print(f"(∆π∆) Frames storage path: {frames_storage}")
print(f"(∆π∆) Results storage path: {results_storage}")
print(f"(∆π∆) Video storage path: {video_storage}")
print(f"(∆π∆) ROI frame storage path: {roi_frames_storage}")
print(f"(∆π∆) ROI frame storage exists: {os.path.exists(roi_frames_storage)}")
print(f"(∆π∆) Frames storage exists: {os.path.exists(frames_storage)}")
print(f"(∆π∆) Results storage exists: {os.path.exists(results_storage)}")
print(f"(∆π∆) Video storage exists: {os.path.exists(video_storage)}")

# Mount the storage directories for static file serving
app.mount("/server-fastapi-roiFrames-storage", StaticFiles(directory=roi_frames_storage), name="roi_frames")
app.mount("/server-fastapi-frames-storage", StaticFiles(directory=frames_storage), name="frames")
app.mount("/server-fastapi-results-storage", StaticFiles(directory=results_storage), name="results")
app.mount("/server-fastapi-video-storage", StaticFiles(directory=video_storage), name="videos")


@app.get("/")
async def root():
    return {"message": "Python FastAPI server is running!"}


@router.post("/upload/video")
async def upload_video(video: UploadFile = File(...)):
    try:
        file_path = os.path.join(video_storage, video.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        return {
            "success": True,
            "message": "Video uploaded successfully",
            "filename": video.filename,
            "path": f"/server-fastapi-video-storage/{video.filename}"
        }
    except Exception as e:
        print(f"Error uploading file: {e}")
        return {
            "success": False,
            "message": {e}
        }
    

@router.get("/video/roi-frame")
async def get_roi_frame():
    try:
        video_files = [f for f in os.listdir(video_storage) 
                      if f.lower().endswith(('.mp4', '.avi', '.mov'))]
        if not video_files:
            return {"success": False, "message": "No video files found"}
            
        video_path = os.path.join(video_storage, video_files[-1])
        
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            frame_path = os.path.join(roi_frames_storage, "roi_frame.png")
            cv2.imwrite(frame_path, frame)
            return {
                "success": True,
                "roiFrame": "/server-fastapi-roiFrames-storage/roi_frame.png"
            }
        else:
            return {"success": False, "message": "Could not read video roi frame"}
            
    except Exception as e:
        print(f"Error getting roi frame: {e}")
        return {
            "success": False,
            "message": {e}
        }


@router.get("/diagnosis/cardiac")
async def diagnose_cardiac(roi:dict):
    try:
        print(f"(∆π∆) Checking video storage: {video_storage}")
        if not os.path.exists(video_storage):
            print(f"(∆π∆) Video storage does not exist: {video_storage}")
            return {"success": False, "message": "Video storage not found"}
   
        video_files = [f for f in os.listdir(video_storage) if f.lower().endswith(('.mp4', '.avi', '.mov'))]
        if not video_files:
            return {"success": False, "message": "No video files found"}
            
        video_name = Path(video_files[0]).stem
        
        success = await video_cardiac_analyze(
            input_path=video_storage,
            frames_path=frames_storage,
            results_path=results_storage,
            roi=roi
        )
        
        if success:
            # Check if output files were generated
            displacement_plot = os.path.join(results_storage, "total_displacement_plot.png")
            registration_csv = os.path.join(results_storage, "registration_results.csv")
            
            if not (os.path.exists(displacement_plot) and os.path.exists(registration_csv)):
                return {
                    "success": False,
                    "message": "Analysis completed but output files not generated"
                }

            return {
                "success": True,
                "videoName": video_name,
                "results": {
                    "displacement_plot": "/server-fastapi-results-storage/total_displacement_plot.png",
                    "registration_data": "/server-fastapi-results-storage/registration_results.csv"
                }
            }
        else:
            return {"success": False, "message": "Analysis failed"}
    
    except Exception as e:
        print(f"Error in diagnosis endpoint: {e}")
        return {"success": False, "message": {e}}


# For REST API Testing
@router.get("/api")
async def api_endpoint():
    return {"message": "Connected"}


app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
