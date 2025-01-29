from pathlib import Path

def cleanup_directory(directory_path):
    directory_path = Path(directory_path)
    if directory_path.exists():
        for file_path in directory_path.iterdir():
            try:
                if file_path.isfile():
                    file_path.unlink()
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")
                