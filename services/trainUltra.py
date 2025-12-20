import os
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow.keras import mixed_precision
import numpy as np
import json
from sklearn.utils import class_weight

# --- 1. CRITICAL GPU SETUP (Prevents OOM Crashes) ---
# This must run before any other TensorFlow code
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"✅ GPU Memory Growth Enabled for {len(gpus)} GPU(s)")
    except RuntimeError as e:
        print(f"❌ GPU Setup Error: {e}")

# Enable Mixed Precision (Speeds up RTX 5090 by 2x)
policy = mixed_precision.Policy('mixed_float16')
mixed_precision.set_global_policy(policy)
print(f"✅ Mixed Precision Policy: {policy.name}")

# --- 2. CONFIGURATION ---
DATASET_PATH = 'data'
IMG_SIZE = (300, 300)  # High resolution for "Ultra" accuracy
BATCH_SIZE = 16        # Kept safe for stability. Try 32 if this works.
EPOCHS_HEAD = 10       # Phase 1: Train only the new top layer
EPOCHS_FINE = 20       # Phase 2: Fine-tune the deep layers
MODEL_SAVE_PATH = 'god_recognizer_ultra.keras'
JSON_SAVE_PATH = 'class_names.json'


def get_class_weights(train_ds):
    """Calculates weights to balance rare gods vs common gods."""
    print("⚖️  Calculating Class Weights...")
    y_train = []
    # Loop through dataset to get all labels (might take a moment)
    for _, labels in train_ds.unbatch():
        y_train.append(labels.numpy())

    y_train = np.array(y_train)
    weights = class_weight.compute_class_weight(
        class_weight='balanced',
        classes=np.unique(y_train),
        y=y_train
    )
    weight_dict = dict(enumerate(weights))
    print(f"✅ Class Weights Ready: {weight_dict}")
    return weight_dict


def build_model(num_classes):
    """Builds EfficientNetV2S with custom top layers."""
    # Input Layer
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))

    # Data Augmentation (Runs on GPU)
    x = layers.RandomFlip("horizontal")(inputs)
    x = layers.RandomRotation(0.15)(x)
    x = layers.RandomZoom(0.15)(x)
    x = layers.RandomContrast(0.1)(x)

    # Base Model (Pre-trained Brain)
    # EfficientNetV2S is powerful but lighter than L/XL
    base_model = tf.keras.applications.EfficientNetV2S(
        include_top=False,
        weights="imagenet",
        input_tensor=x,
        include_preprocessing=True  # Handles 0-255 scaling automatically
    )

    # Freeze base model initially
    base_model.trainable = False

    # Rebuild top
    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)  # Prevents overfitting

    # Output Layer (Softmax needs float32 for stability)
    outputs = layers.Dense(
        num_classes, activation="softmax", dtype="float32")(x)

    model = models.Model(inputs, outputs, name="GodRecognizer_Ultra")
    return model, base_model


def train_ultra():
    print(f"--- Loading Data from {DATASET_PATH} ---")

    # Load Training Data
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='int'
    )

    # Load Validation Data
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='int'
    )

    class_names = train_ds.class_names
    print(f"Found classes: {class_names}")

    # Save class names for the API
    with open(JSON_SAVE_PATH, 'w') as f:
        json.dump(class_names, f)

    # Optimize Dataset Performance (Prefetching)
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Calculate Weights
    class_weights = get_class_weights(train_ds)

    # Build Model
    model, base_model = build_model(len(class_names))
    model.summary()

    # --- PHASE 1: WARM UP (Train only top layers) ---
    print("\n🚀 PHASE 1: Training Head...")
    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    model.fit(
        train_ds,
        epochs=EPOCHS_HEAD,
        validation_data=val_ds,
        class_weight=class_weights
    )

    # --- PHASE 2: FINE TUNING (Unlock the brain) ---
    print("\n🧠 PHASE 2: Fine-Tuning Deep Layers...")

    # Unfreeze the top 100 layers of the base model
    base_model.trainable = True
    for layer in base_model.layers[:-100]:
        layer.trainable = False

    # Recompile with very low learning rate (Don't break what we learned)
    model.compile(
        optimizer=optimizers.AdamW(learning_rate=1e-5, weight_decay=1e-4),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    # Callbacks
    early_stop = callbacks.EarlyStopping(
        monitor='val_loss', patience=5, restore_best_weights=True, verbose=1
    )
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.2, patience=3, min_lr=1e-7, verbose=1
    )
    checkpoint = callbacks.ModelCheckpoint(
        MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True, verbose=1
    )

    history = model.fit(
        train_ds,
        epochs=EPOCHS_FINE,
        validation_data=val_ds,
        class_weight=class_weights,
        callbacks=[early_stop, reduce_lr, checkpoint]
    )

    print(f"\n✅ Training Complete. Best model saved to {MODEL_SAVE_PATH}")


if __name__ == "__main__":
    train_ultra()
