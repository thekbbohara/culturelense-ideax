import tensorflow as tf
from tensorflow.keras import layers, models
import json
import os

# --- Configuration ---
DATASET_PATH = 'data'
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
MODEL_SAVE_PATH = 'god_recognizer.keras'
LABELS_SAVE_PATH = 'class_names.json'

def train_model():
    print("Loading data...")
    # Load data from folders; infers labels from folder names
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    # Save class names (e.g., ['Ganesha', 'Shiva', 'Vishnu']) so we can use them later
    class_names = train_ds.class_names
    with open(LABELS_SAVE_PATH, 'w') as f:
        json.dump(class_names, f)
    print(f"Classes found: {class_names}")

    # Optimize data loading performance
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)

    # --- Build Model (Transfer Learning with MobileNetV2) ---
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base model to keep pre-trained knowledge

    model = models.Sequential([
        # Preprocessing layer (scales pixels to [-1, 1])
        layers.Rescaling(1./127.5, offset=-1, input_shape=IMG_SIZE + (3,)),
        
        # Data Augmentation (optional, helps if you have few images)
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(len(class_names), activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    # --- Train ---
    print("Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS
    )

    # Save the model
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    train_model()
