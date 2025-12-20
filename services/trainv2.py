import tensorflow as tf
from tensorflow.keras import layers, models, applications, callbacks
import json
import os
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

# --- Configuration ---
DATASET_PATH = 'data'
# Increased resolution helps see small details (weapons/mudras)
IMG_SIZE = (260, 260)
BATCH_SIZE = 16       # Smaller batch size can sometimes help generalization
MODEL_SAVE_PATH = 'god_recognizer_best.keras'
LABELS_SAVE_PATH = 'class_names.json'


def train_best_model():
    print("--- 1. Loading Data ---")

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

    class_names = train_ds.class_names
    num_classes = len(class_names)

    # Save labels
    with open(LABELS_SAVE_PATH, 'w') as f:
        json.dump(class_names, f)

    # Performance tuning
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)

    # --- 2. Callbacks (The Secret to Accuracy) ---
    early_stop = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=6,            # Stop if no improvement after 6 epochs
        restore_best_weights=True
    )

    save_best = callbacks.ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor='val_accuracy',
        save_best_only=True,   # Only save if this epoch is better than the last
        mode='max',
        verbose=1
    )

    # --- 3. Build Model (EfficientNetV2B1) ---
    # V2B1 is slightly larger than B0, better for fine-grained details
    base_model = applications.EfficientNetV2B1(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    # Aggressive Data Augmentation
    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.2),
        layers.RandomContrast(0.2),
        layers.RandomTranslation(0.1, 0.1)
    ])

    inputs = layers.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)
    x = applications.efficientnet_v2.preprocess_input(
        x)  # Native preprocessing
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = models.Model(inputs, outputs)

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    # --- 4. Training Phase 1 (Head) ---
    print("\n--- Training Head ---")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        callbacks=[save_best]  # Save whenever we hit a record high accuracy
    )

    # --- 5. Training Phase 2 (Fine Tuning) ---
    print("\n--- Fine-Tuning ---")
    base_model.trainable = True

    # Freeze the bottom 100 layers, train the top layers
    for layer in base_model.layers[:-100]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5),  # Very slow learning rate
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    total_epochs = 40
    history_fine = model.fit(
        train_ds,
        validation_data=val_ds,
        initial_epoch=history.epoch[-1],
        epochs=total_epochs,
        callbacks=[save_best, early_stop]  # Now using Early Stopping
    )

    print(f"\nTraining Complete. Best model saved to: {MODEL_SAVE_PATH}")

    # --- 6. Sanity Check (Confusion Matrix) ---
    # This tells you EXACTLY where the model is failing
    print("\nGenerating Report...")
    y_true = []
    y_pred = []

    for images, labels in val_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))

    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))


if __name__ == '__main__':
    train_best_model()
