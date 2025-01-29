from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import cv2
from diagnosis_cardiac import analyze_video_cardiac
from utils import cleanup_directory


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


# current directory and storage paths
current_dir = Path(__file__).parent

roi_frames_storage = current_dir / "server-fastapi-roiFrames-storage"
frames_storage = current_dir / "server-fastapi-frames-storage"
results_storage = current_dir / "server-fastapi-results-storage"
video_storage = current_dir / "server-fastapi-video-storage"


# static file serving
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

        cleanup_directory(frames_storage)
        cleanup_directory(video_storage)

        file_path = video_storage / video.filename
        
        file_path.write_bytes(video.file.read())
        
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
        video_files = list(video_storage.glob('*.mp4')) + list(video_storage.glob('*.avi')) + list(video_storage.glob('*.mov'))
        if not video_files:
            return {"success": False, "message": "No video files found"}
            
        video_path = video_files[-1]
        video_filename = video_path.stem
        
        cap = cv2.VideoCapture(video_path)

        # Get upload video dimensions
        actual_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        ret, frame = cap.read()
        cap.release()
        
        if ret:
            roi_frame_name = f"roi_frame_{video_filename}.png"
            frame_path = roi_frames_storage / roi_frame_name
            cv2.imwrite(frame_path, frame)
            return {
                "success": True,
                "roiFrame": f"/server-fastapi-roiFrames-storage/{roi_frame_name}",
                "videoWidth": actual_width,
                "videoHeight": actual_height
            }
        else:
            return {"success": False, "message": "Could not read video roi frame"}
            
    except Exception as e:
        print(f"Error getting roi frame: {e}")
        return {
            "success": False,
            "message": {e}
        }


@router.post("/diagnosis/cardiac")
async def diagnose_cardiac(roi:dict):
    try:
        
        if not video_storage.exists():
            raise ValueError(f"Video storage directory does not exist: {video_storage}")
   
        video_files = list(video_storage.glob('*.mp4')) + list(video_storage.glob('*.avi')) + list(video_storage.glob('*.mov'))

        if not video_files:
            return {"success": False, "message": "No video files found"}
            
        video_name = video_files[0].stem
        
        success = await analyze_video_cardiac(
            input_path=video_storage,
            frames_path=frames_storage,
            results_path=results_storage,
            roi=roi
        )
        
        if success:

            displacement_plots = f"cardiac_displacement_plots_{video_name}.png"
            registration_csv = f"cardiac_registration_results_{video_name}.csv"
            avg_csv = f"cardiac_avg_displacement_results_{video_name}.csv"

            # log path
            plot_path = results_storage / displacement_plots
            print(f"(∆π∆) Plot path exists: {os.path.exists(plot_path)}")
            print(f"(∆π∆) Full plot URL: /server-fastapi-results-storage/{displacement_plots}")

            return {
                "success": True,
                "videoName": video_name,
                "results": {
                    "displacement_plots": f"/server-fastapi-results-storage/{displacement_plots}",
                    "registration_csv": f"/server-fastapi-results-storage/{registration_csv}",
                    "avg_csv": f"/server-fastapi-results-storage/{avg_csv}"
                }
            }
        else:
            return {"success": False, "message": "Analysis failed"}
    
    except Exception as e:
        return {"success": False, "message": {e}}


@router.get("/cleanup_server_storage")
async def cleanup_endpoint():
    cleanup_directory(frames_storage)
    cleanup_directory(results_storage)
    cleanup_directory(roi_frames_storage)
    cleanup_directory(video_storage)
    return {"message": "All Server Storage Cleaned Up!"}


app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
