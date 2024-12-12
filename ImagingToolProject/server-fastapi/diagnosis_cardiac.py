import cv2
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import csv
import os
from pathlib import Path
from typing import Tuple, List
import asyncio
from concurrent.futures import ThreadPoolExecutor

# AGG backend is for writing to file, not for rendering in a window
matplotlib.use('Agg')

class VideoProcessor:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = None
        self.frames = []
        self.frame_count = 0

    def load_video(self) -> bool:
        self.cap = cv2.VideoCapture(self.video_path)
        if not self.cap.isOpened():
            raise ValueError(f"Error: Could not open video file {self.video_path}")
        self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        return True

    def extract_frames(self) -> List[np.ndarray]:
        while True:
            ret, frame = self.cap.read()
            if not ret:
                break
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            self.frames.append(gray_frame)
        self.cap.release()
        return self.frames

class IntensityAnalyzer:
    def __init__(self, frames: List[np.ndarray]):
        self.frames = frames
        self.intensities = []

    def cal_intensities(self) -> List[float]:
        self.intensities = [np.mean(frame) for frame in self.frames]
        return self.intensities

    def get_analysis_data(self) -> dict:
        return {
            "frame_number": list(range(len(self.intensities))),
            "average_intensity": self.intensities
        }

class DataVisualizer:
    def __init__(self, frame_numbers: List[int], intensities: List[float]):
        self.frame_numbers = frame_numbers
        self.intensities = intensities

    def create_plot(self) -> plt.Figure:
        plt.figure(figsize=(12, 6))
        plt.plot(self.frame_numbers, self.intensities, "b-")
        plt.title("Average Pixel Intensity Across Video Frames")
        plt.xlabel("Frame Number")
        plt.ylabel("Average Intensity")
        plt.grid(True)
        return plt

class DataExporter:
    def __init__(self, data: dict):
        self.data = data

    def export_to_csv(self, output_path: str) -> bool:
        frame_numbers = self.data["frame_number"]
        intensities = self.data["average_intensity"]

        with open(output_path, "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["frame_number", "average_intensity"])
            for frame_num, intensity in zip(frame_numbers, intensities):
                writer.writerow([frame_num, round(intensity, 2)])
        return True

def get_absolute_paths() -> Tuple[Path, Path]:
    current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    input_folder = current_dir.parent / "frontend-generated"
    output_folder = current_dir / "server-fastapi-temporary"
    return input_folder, output_folder

def _process_video_sync(input_folder: Path, output_folder: Path) -> bool:

    print(f"(∆π∆)Input folder: {input_folder}")
    print(f"(∆π∆)Output folder: {output_folder}")

    video_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.mp4', '.avi', '.mov'))]
    if not video_files:
        raise ValueError(f"No video files found in {input_folder}")

    video_path = os.path.join(input_folder, video_files[0])
    video_name = Path(video_files[0]).stem

    output_plot_path = os.path.join(output_folder, f"{video_name}_intensity_plot.png")
    output_csv_path = os.path.join(output_folder, f"{video_name}_intensity_data.csv")

    try:
        processor = VideoProcessor(video_path)
        processor.load_video()
        frames = processor.extract_frames()

        analyzer = IntensityAnalyzer(frames)
        analyzer.cal_intensities()
        analysis_data = analyzer.get_analysis_data()

        visualizer = DataVisualizer(
            analysis_data["frame_number"],
            analysis_data["average_intensity"]
        )
        plt = visualizer.create_plot()
        plt.savefig(output_plot_path)
        plt.close()

        exporter = DataExporter(analysis_data)
        exporter.export_to_csv(output_csv_path)

        return True

    except Exception as e:
        print(f"Error during video analysis: {e}")
        return False


async def video_cardiac_analyze() -> bool:
    input_folder, output_folder = get_absolute_paths()
    
    # Run CPU-intensive video processing in a thread pool
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(
            pool, _process_video_sync, input_folder, output_folder
        )
    
    return result
