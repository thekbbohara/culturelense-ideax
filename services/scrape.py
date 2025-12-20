import os
import shutil
from bing_image_downloader import downloader
from PIL import Image

# 1. Define your list of gods exactly as you pasted
god_names = [
    "Avalokiteshvara", "buddha", "Chamunda", "Ganga", "Manjushri",
    "Narayan_Lakshmi", "shiva", "Shiva_Lingam", "Surya", "Vajrapani",
    "Vishnu", "Bhairava_head", "Chakrasamvara_Vajravarahi", "Ganesha",
    "Maitreya", "Nandi", "Saraswati", "shiva_ling_4head", "singha",
    "Uma_Maheshwara", "Vajrasattva", "Vishnu_Lakshmi_Bhudevi"
]

BASE_DIR = "data"
TEMP_DIR = "temp_download"
IMAGES_PER_CLASS = 50  # Change this to how many images you want per god


def convert_to_jpeg(directory):
    """
    Scans a directory, converts all images to JPEG, and deletes non-JPEGs.
    This ensures your training model doesn't crash on PNG/WebP files.
    """
    print(f"Processing images in {directory}...")
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)

        # Skip if it's already a directory
        if os.path.isdir(filepath):
            continue

        try:
            # Open image
            with Image.open(filepath) as img:
                # Convert to RGB (removes transparency from PNGs)
                rgb_im = img.convert('RGB')

                # Define new name with .jpg extension
                root, _ = os.path.splitext(filepath)
                new_filepath = root + ".jpg"

                # Save as JPEG
                rgb_im.save(new_filepath, "JPEG")

            # If the original file wasn't .jpg, remove it (to avoid duplicates)
            if filepath != new_filepath:
                os.remove(filepath)

        except Exception as e:
            print(f"Error processing {filename}: {e}")
            # If file is corrupt, delete it
            if os.path.exists(filepath):
                os.remove(filepath)


def download_and_organize():
    for god in god_names:
        # 1. Construct the query as requested: prefix 'god' -- suffix 'image'
        # We replace underscores with spaces for better search results (e.g. "god Shiva Lingam image")
        search_query = f"god {god.replace('_', ' ')} image"

        print(f"--- Downloading: {god} (Query: '{search_query}') ---")

        # 2. Download into a temporary folder
        downloader.download(
            search_query,
            limit=IMAGES_PER_CLASS,
            output_dir=TEMP_DIR,
            adult_filter_off=True,
            force_replace=False,
            timeout=60,
            verbose=False
        )

        # 3. Move and Rename folder to match your data structure
        # Downloader creates: temp_download/god Shiva Lingam image/
        # We want: data/Shiva_Lingam/

        source_folder = os.path.join(TEMP_DIR, search_query)
        target_folder = os.path.join(BASE_DIR, god)

        # Create target directory if not exists
        if not os.path.exists(target_folder):
            os.makedirs(target_folder)

        # Move files
        if os.path.exists(source_folder):
            for file_name in os.listdir(source_folder):
                shutil.move(os.path.join(
                    source_folder, file_name), target_folder)

            # Remove the empty temp folder created by downloader
            os.rmdir(source_folder)

        # 4. Convert all downloaded files in the target folder to JPEG
        convert_to_jpeg(target_folder)

    # Cleanup main temp dir
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)

    print("\nDone! All images are in 'data/' folder and converted to JPEG.")


if __name__ == "__main__":
    download_and_organize()
