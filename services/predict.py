import tensorflow as tf
import numpy as np
import json

MODEL_PATH = 'god_recognizer.keras'
LABELS_PATH = 'class_names.json'


def predict_god(image_path):
    # 1. Load Model and Labels
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(LABELS_PATH, 'r') as f:
        class_names = json.load(f)

    # 2. Load and Preprocess Image
    img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
    img_array = tf.keras.utils.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)  # Create a batch

    # 3. Predict
    predictions = model.predict(img_array)
    score = tf.nn.softmax(predictions[0])

    predicted_class = class_names[np.argmax(score)]
    confidence = 100 * np.max(score)

    print(f"This image is most likely: {
          predicted_class} ({confidence:.2f}% confidence)")
    return predicted_class


# Example Usage
if __name__ == '__main__':
    # Replace with the path to a new image you want to test
    predict_god('test_image.jpg')
