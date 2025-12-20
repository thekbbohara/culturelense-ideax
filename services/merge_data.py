import os
import shutil

# --- Configuration ---
SOURCE_DIR = "./scrape/statuestudio_data"  # New images
DEST_DIR = "data"                 # Main dataset

# --- THE SMART MAPPING ---
# Key = The name appearing in the NEW folder (StatueStudio)
# Value = The exact folder name in YOUR EXISTING data
# (I filled this based on your previous logs, but you can add more)
FOLDER_MAP = {
    # New Name (StatueStudio) : Your Existing Folder Name
    "Ganpati": "Ganesha",
    "Vinayaka": "Ganesha",
    "Mahadev": "shiva",
    "Shiv": "shiva",
    "Shiva": "shiva",  # Fixes case sensitivity (Shiva -> shiva)
    "Nataraja": "shiva",
    "Laxmi": "Narayan_Lakshmi",  # Deciding where Laxmi goes
    "Lakshmi": "Narayan_Lakshmi",
    "Bajrangbali": "Hanuman",
    "Ram": "Ram",
    "Rama": "Ram",
    "Gopal": "Krishna",
    "Laddu Gopal": "Krishna",
    "Chenrezig": "Avalokiteshvara",
    "Sherawali": "Durga",
    # Add any others here...
}


def normalize_name(name):
    """
    Tries to find the correct destination folder name.
    1. Checks the specific map above.
    2. Checks for case-insensitive match (e.g. 'Vishnu' -> 'vishnu')
    3. Defaults to the original name if no match found.
    """
    # 1. Check strict mapping
    if name in FOLDER_MAP:
        return FOLDER_MAP[name]

    # 2. Check existing folders for case-insensitive match
    # (e.g. if you have 'vishnu', and new folder is 'Vishnu', use 'vishnu')
    if os.path.exists(DEST_DIR):
        existing_folders = os.listdir(DEST_DIR)
        for existing in existing_folders:
            if existing.lower() == name.lower():
                return existing

    # 3. If completely new, keep the new name
    return name


def merge_datasets():
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ Source folder '{SOURCE_DIR}' not found!")
        return

    print(f"--- Merging '{SOURCE_DIR}' into '{DEST_DIR}' ---")

    total_moved = 0
    new_folders_created = 0

    # Walk through the NEW images
    for root, dirs, files in os.walk(SOURCE_DIR):
        for filename in files:
            # Get the current folder name (e.g., "Ganpati")
            original_folder_name = os.path.basename(root)

            # Find the CORRECT destination name (e.g., "Ganesha")
            target_folder_name = normalize_name(original_folder_name)

            # Show what is happening (only once per folder)
            if original_folder_name != target_folder_name:
                # We only print this debug info occasionally or it gets spammy
                pass

            # Construct paths
            source_file = os.path.join(root, filename)
            dest_folder = os.path.join(DEST_DIR, target_folder_name)

            # 1. HANDLE MISSING DIR: Create it if it doesn't exist
            if not os.path.exists(dest_folder):
                os.makedirs(dest_folder)
                print(f"   [New Class] Created folder: {dest_folder}")
                new_folders_created += 1

            # 2. HANDLE DUPLICATES: Rename file if name conflicts
            name, ext = os.path.splitext(filename)
            dest_file = os.path.join(dest_folder, filename)

            counter = 1
            while os.path.exists(dest_file):
                dest_file = os.path.join(
                    dest_folder, f"{name}_studio_{counter}{ext}")
                counter += 1

            # Move
            shutil.move(source_file, dest_file)
            total_moved += 1

    # Cleanup empty source folder
    shutil.rmtree(SOURCE_DIR)

    print("-" * 40)
    print(f"✅ Merge Complete!")
    print(f"📦 Images Moved: {total_moved}")
    print(f"wnew Categories Created: {new_folders_created}")
    print("-" * 40)


if __name__ == "__main__":
    merge_datasets()
