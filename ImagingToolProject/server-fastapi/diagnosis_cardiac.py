import cv2
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from pathlib import Path
from typing import List
from multiprocessing import cpu_count
import pandas as pd
from ABI_subpixel import register_images

# AGG backend is for writing to file, not for rendering in a window
matplotlib.use('Agg')

class VideoProcess:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = None
        self.frames = []
        self.frame_count = 0
        self.registration_results = []
        self.registration_locations = []
        self.roi = None
        self.actual_width = None
        self.actual_height = None
        self.fps = None
    
    def load_video(self):
        self.cap = cv2.VideoCapture(self.video_path)
        if not self.cap.isOpened():
            raise ValueError(f"Error: Could not open video file {self.video_path}")
        
        # store upload video dimensions
        self.actual_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.actual_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)       
    
    def set_roi(self, x: int, y: int, width: int, height: int):

        if self.actual_width is None or self.actual_height is None:
            raise ValueError("Video must be loaded before setting ROI")
            
        # validate and clamp coordinates to video dimensions
        x = max(0, min(x, self.actual_width))
        y = max(0, min(y, self.actual_height))
        width = min(width, self.actual_width - x)
        height = min(height, self.actual_height - y)

        self.roi = (x, y, width, height)
    
    def extract_frames(self, output_folder: Path) -> List[np.ndarray]:
        frame_count = 0
        while True:
            ret, frame = self.cap.read()
            if not ret:
                break

            if self.roi:
                x, y, w, h = self.roi
                # roi validation check
                if y+h <= frame.shape[0] and x+w <= frame.shape[1]:
                    frame = frame[y:y+h, x:x+w]
                else:
                    print(f"Warning: ROI dimensions ({x+w}x{y+h}) exceed frame dimensions ({frame.shape[1]}x{frame.shape[0]})")
                    continue

            frame_filename = output_folder / f"frame_{frame_count:03d}.png"
            cv2.imwrite(frame_filename, frame)
            self.frames.append(frame)
            frame_count += 1
        self.cap.release()
        return self.frames


class ImageRegistration:
    def __init__(self, frames: List[np.ndarray]):
        self.frames = frames
        self.registration_results = []
        self.registration_locations = []

    def register_frames(self, frames_dir: Path):
        frame_files = sorted([f for f in frames_dir.glob("frame_*.png")])
        
        print(f"(∆π∆)\nTotal number of frames decomposed: {len(frame_files)}\n(∆π∆)")

        if len(frame_files) < 2:
            print("Not enough frames to perform registration. Exiting...")
            return None

        reference_path = frame_files[1]
        reference_frame = cv2.imread(reference_path)

        if reference_frame is None:
            print(f"Failed to load reference frame: {reference_path}")
            return False

        for i, frame_path in enumerate(frame_files[1:]):
            current_frame = cv2.imread(frame_path)

            if current_frame is None:
                print(f"Failed to load frame: {frame}")
                continue

            try:
                results, locs = register_images(
                    im1=reference_frame,
                    im2=current_frame,
                    plot=False,
                    threads=cpu_count() - 2,
                    stride=15,
                    windowsize=64,
                    thresh=10
                )

                self.registration_results.append((i, results))
                self.registration_locations.append(locs)

            except Exception as e:
                print(f"Error during registration of frame {i}: {e}")
                continue

        return self.registration_results, self.registration_locations
    

class ImgRegDataProcess:
    def __init__(self, fps: float):
        self.fps = fps
        self.registration_df = None
        self.avg_displacement_df = None

    def process_displacement(self, registration_results: List, registration_locations: List):
        try:
            registration_data_list = []
            for frame_num, results in registration_results:
                locs = registration_locations[frame_num]
                for j in range(len(results)):
                    registration_data_list.append({
                        "Frame": frame_num,
                        "Loc_Y": locs[j][1],
                        "Loc_X": locs[j][0],
                        "Disp_Y": results[j][0][0],
                        "Disp_X": results[j][0][1]
                    })

            self.registration_df = pd.DataFrame(registration_data_list)
            
            self.registration_df["Total_Displacement"] = np.sqrt(
                self.registration_df["Disp_X"] ** 2 + self.registration_df["Disp_Y"] ** 2
            )
            
            self.avg_displacement_df = self.registration_df.groupby("Frame")[["Total_Displacement"]].mean().reset_index()
            
            return True
        
        except Exception as e:
            print(f"Error calculating displacement: {e}")
            return False

    def save_to_csv(self, results_dir: Path, video_name: str):
        try:
            if self.registration_df is None or self.avg_displacement_df is None:
                raise ValueError("Please process displacement first")

            registration_results_path = results_dir / f"cardiac_registration_results_{video_name}.csv"
            self.registration_df.to_csv(registration_results_path, index=False)

            self.avg_displacement_df["Time(s)"] = self.avg_displacement_df["Frame"] / self.fps

            avg_displacement_results_path = results_dir / f"cardiac_avg_displacement_results_{video_name}.csv"
            self.avg_displacement_df.to_csv(avg_displacement_results_path, index=False)

            return True
        
        except Exception as e:
            print(f"Error saving data: {e}")
            return False


class DataVisualization:
    def __init__(self, data_process_exe: ImgRegDataProcess):
        self.data_process_exe = data_process_exe

    def create_plots(self, results_dir: Path, video_name: str) -> bool:
        if self.data_process_exe.registration_df is None or self.data_process_exe.avg_displacement_df is None:
            print("No data available for plotting")
            return False

        try:
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 12))

            # Plot 1: All grid points
            unique_points = self.data_process_exe.registration_df.groupby(["Loc_Y", "Loc_X"])
            num_points = len(unique_points)
            for (loc_y, loc_x), group in unique_points:
                ax1.plot(group["Frame"], group["Total_Displacement"], "-", alpha=0.5,
                        label=f"Point ({loc_y}, {loc_x})")
                
            ax1.set_xlabel("Frame Number")
            ax1.set_ylabel("Total Displacement (pixels)")
            ax1.set_title(f"Total Displacement for {num_points} Grid Points")
            ax1.grid(True)

            # Plot 2: Average displacement
            ax2.plot(self.data_process_exe.avg_displacement_df["Time(s)"],
                    self.data_process_exe.avg_displacement_df["Total_Displacement"],
                    '-', linewidth=2, color='blue')
            
            start_time = self.data_process_exe.avg_displacement_df["Time(s)"].min()
            end_time = self.data_process_exe.avg_displacement_df["Time(s)"].max()

            total_duration = end_time - start_time

            if total_duration > 10:
                interval = total_duration / 10  
            elif total_duration > 5:
                interval = total_duration / 8   
            else:
                interval = total_duration / 6   

            interval = round(interval, 1)

            ax2.set_xticks(np.arange(start_time, end_time + 0.1, interval))

            ax2.set_xlabel("Time (seconds)")
            ax2.set_ylabel("Average Displacement (pixels)")
            ax2.set_title("Average Displacement over Time")
            ax2.grid(True)

            plt.tight_layout()
            plot_path = results_dir / f"cardiac_displacement_plots_{video_name}.png"
            fig.savefig(plot_path)
            plt.close('all')
            return True

        except Exception as e:
            print(f"Error creating plots: {e}")
            return False
    

async def process_video(input_folder_path: Path, frames_storage_path: Path, results_storage_path: Path, roi: dict=None) -> bool:

    try:
        print(f"(∆π∆)\nReceived ROI coordinates - x:{roi['x']}, y:{roi['y']}, width:{roi['width']}, height:{roi['height']}\n(∆π∆)")

        video_files = list(input_folder_path.glob("*.mp4")) + list(input_folder_path.glob("*.avi")) + list(input_folder_path.glob("*.mov"))
       
        if not video_files:
            raise ValueError(f"No video files found in {input_folder_path}")
        
        video_path = video_files[0]
        video_name = video_path.stem

        video_process_exe = VideoProcess(video_path)
        video_process_exe.load_video()

        if roi:
            video_process_exe.set_roi(
                int(roi["x"]), 
                int(roi["y"]), 
                int(roi["width"]), 
                int(roi["height"])
            )
            
        frames = video_process_exe.extract_frames(frames_storage_path)

        analysis_exe = ImageRegistration(frames)
        registration_results, registration_locations = analysis_exe.register_frames(frames_storage_path)

        if not registration_results or not registration_locations:
            return False

        data_process_exe = ImgRegDataProcess(video_process_exe.fps)
        if not data_process_exe.process_displacement(registration_results, registration_locations):
            return False
            
        if not data_process_exe.save_to_csv(results_storage_path, video_name):
            return False

        visualise_exe = DataVisualization(data_process_exe)
        if not visualise_exe.create_plots(results_storage_path, video_name):
            return False

        return True
        
    except Exception as e:
        print(f"Error during video analysis: {e}")
        return False


async def analyze_video_cardiac(input_path: str, frames_path: str, results_path: str, roi: dict = None) -> bool:
    try:
        input_path_obj = Path(input_path)
        frames_path_obj = Path(frames_path)
        results_path_obj = Path(results_path)

        result = await process_video(input_path_obj, frames_path_obj, results_path_obj, roi)
        return result
    except Exception as e:
        print(f"Error in video cardiac analyze: {e}")
        return False
    