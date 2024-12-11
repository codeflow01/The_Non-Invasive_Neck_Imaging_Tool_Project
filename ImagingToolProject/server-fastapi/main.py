from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from diagnosis_cardiac import video_cardiac_analyze
from fastapi.staticfiles import StaticFiles


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

# Mount the static files directory
app.mount("/server-fastapi-temporary", StaticFiles(directory="server-fastapi-temporary"), name="static")


@app.get("/")
async def root():
    return {"message": "Python FastAPI server is running!"}


@router.get("/diagnosis/cardiac")
async def diagnose_cardiac():
    try:
        success = await video_cardiac_analyze()
        return {"success": success}
    except Exception as e:
        print(f"Error in diagnosis endpoint: {e}")
        return {"success": False}


# For REST API Testing
@router.get("/api")
async def api_endpoint():
    return {"message": "Server launched!"}

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
