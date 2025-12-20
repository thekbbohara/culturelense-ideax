import tensorflow as tf
import numpy as np
import json
import sys
import os

# --- Configuration ---
MODEL_PATH = 'god_recognizer_ultra.keras'
LABELS_PATH = 'class_names.json'  # This was created during training
IMG_SIZE = (300, 300)  # MUST match the size used in training!


def load_resources():
    print("Loading model and labels...")
    if not os.path.exists(MODEL_PATH):
        sys.exit(f"Error: Model file '{MODEL_PATH}' not found.")
    if not os.path.exists(LABELS_PATH):
        sys.exit(f"Error: Labels file '{LABELS_PATH}' not found.")

    model = tf.keras.models.load_model(MODEL_PATH)

    with open(LABELS_PATH, 'r') as f:
        class_names = json.load(f)

    return model, class_names


def predict_image(image_path):
    model, class_names = load_resources()

    print(f"Analyzing {image_path}...")

    # 1. Preprocess Image
    try:
        img = tf.keras.utils.load_img(image_path, target_size=IMG_SIZE)
    except Exception as e:
        sys.exit(f"Error loading image: {e}")

    img_array = tf.keras.utils.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)  # Create a batch of 1

    # 2. Get Predictions
    predictions = model.predict(img_array, verbose=0)
    scores = tf.nn.softmax(predictions[0])  # Convert to percentages

    # 3. Show Top 3 Results (Best for similar gods)
    # Get indices of top 3 scores
    top_3_indices = np.argsort(scores)[::-1][:3]

    print("\n--- Results ---")
    for i in top_3_indices:
        god_name = class_names[i]
        confidence = 100 * scores[i]
        print(f"• {god_name}: {confidence:.2f}%")


if __name__ == '__main__':
    # Usage: python predict.py path/to/image.jpg
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_image>")
    else:
        predict_image(sys.argv[1])
