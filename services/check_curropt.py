import tensorflow as tf
import os
import shutil

DATA_DIR = 'data'


def check_images():
    print(f"--- Scanning '{DATA_DIR}' for corrupt files ---")

    corrupt_count = 0
    checked_count = 0

    # Walk through every folder
    for root, dirs, files in os.walk(DATA_DIR):
        for filename in files:
            file_path = os.path.join(root, filename)
            checked_count += 1

            # Print progress every 100 images
            if checked_count % 100 == 0:
                print(f"Checked {checked_count} images...", end='\r')

            try:
                # 1. Read the raw file
                file_contents = tf.io.read_file(file_path)

                # 2. Force TensorFlow to decode it (This triggers the error if corrupt)
                # expand_animations=False fixes issues with some GIFs renamed as JPGs
                image = tf.io.decode_image(
                    file_contents, expand_animations=False)

                # 3. Force execution (TF is lazy, we must print shape to force the decode)
                _ = image.shape

            except Exception as e:
                print(f"\n❌ CORRUPT: {file_path}")
                # Print first 100 chars of error
                print(f"   Error: {str(e)[:100]}...")

                # Move to a 'bad_files' folder instead of deleting immediately (safety)
                bad_dir = "bad_files"
                if not os.path.exists(bad_dir):
                    os.makedirs(bad_dir)

                # Move the bad file
                new_path = os.path.join(bad_dir, f"{filename}_corrupt")
                shutil.move(file_path, new_path)
                print(f"   -> Moved to {bad_dir}/")
                corrupt_count += 1

    print(f"\n\nScan Complete.")
    print(f"Checked: {checked_count}")
    print(f"Corrupt Found & Removed: {corrupt_count}")


if __name__ == "__main__":
    check_images()
