import json
import numpy as np
from sklearn.utils import class_weight
from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow import keras
import tensorflow as tf
import os

# --- 0. RTX 5090 STABILITY FLAGS (MUST BE FIRST) ---
# Disables XLA compilation and Autotune to prevent "Graph execution error"
# on the new Blackwell architecture until drivers mature.
os.environ["TF_XLA_FLAGS"] = "--tf_xla_auto_jit=0"
os.environ["TF_CUDNN_USE_AUTOTUNE"] = "0"


# --- 1. GPU SETUP ---
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"✅ GPU Memory Growth Enabled for {len(gpus)} GPU(s)")
    except RuntimeError as e:
        print(f"❌ GPU Setup Error: {e}")

# Enable Mixed Precision (Crucial for 5090 Speed)
# In TF-Nightly/Keras 3, we set the policy slightly differently if needed,
# but this standard method usually works fine.
try:
    keras.mixed_precision.set_global_policy("mixed_float16")
    print("✅ Mixed Precision Enabled (FP16)")
except Exception as e:
    print(f"⚠️ Mixed Precision skipped: {e}")

# --- 2. CONFIGURATION ---
DATASET_PATH = 'data'
IMG_SIZE = (300, 300)
BATCH_SIZE = 32         # Increased to 32 because 5090 has 32GB VRAM
EPOCHS_HEAD = 10
EPOCHS_FINE = 20
MODEL_SAVE_PATH = 'god_recognizer_ultra.keras'
JSON_SAVE_PATH = 'class_names.json'


def get_class_weights(train_ds):
    """Calculates weights to balance rare gods vs common gods."""
    print("⚖️  Calculating Class Weights (scanning dataset)...")
    y_train = []
    # Note: iterating the dataset can be slow if dataset is huge
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
    # Input
    inputs = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))

    # Data Augmentation
    x = layers.RandomFlip("horizontal")(inputs)
    x = layers.RandomRotation(0.15)(x)
    x = layers.RandomZoom(0.15)(x)
    x = layers.RandomContrast(0.1)(x)

    # Base Model (EfficientNetV2S)
    base_model = keras.applications.EfficientNetV2S(
        include_top=False,
        weights="imagenet",
        input_tensor=x,
        include_preprocessing=True
    )

    base_model.trainable = False

    # Rebuild top
    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)

    # Output (Float32 is required for Softmax output in Mixed Precision)
    outputs = layers.Dense(
        num_classes, activation="softmax", dtype="float32")(x)

    model = models.Model(inputs, outputs, name="GodRecognizer_Ultra")
    return model, base_model


def train_ultra():
    print(f"--- Loading Data from {DATASET_PATH} ---")

    # Load Training Data
    train_ds = keras.utils.image_dataset_from_directory(
        DATASET_PATH,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='int'
    )

    # Load Validation Data
    val_ds = keras.utils.image_dataset_from_directory(
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

    with open(JSON_SAVE_PATH, 'w') as f:
        json.dump(class_names, f)

    # Calculate Weights BEFORE optimizing dataset (otherwise iteration fails)
    class_weights = get_class_weights(train_ds)

    # Optimize Dataset Performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Build Model
    model, base_model = build_model(len(class_names))
    model.summary()

    # --- PHASE 1: WARM UP ---
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

    # --- PHASE 2: FINE TUNING ---
    print("\n🧠 PHASE 2: Fine-Tuning Deep Layers...")

    base_model.trainable = True
    # Freeze the bottom layers, keep top 100 trainable
    for layer in base_model.layers[:-100]:
        layer.trainable = False

    model.compile(
        optimizer=optimizers.AdamW(learning_rate=1e-5, weight_decay=1e-4),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks_list = [
        callbacks.EarlyStopping(
            monitor='val_loss', patience=5, restore_best_weights=True, verbose=1),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.2, patience=3, min_lr=1e-7, verbose=1),
        callbacks.ModelCheckpoint(
            MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True, verbose=1)
    ]

    model.fit(
        train_ds,
        epochs=EPOCHS_FINE,
        validation_data=val_ds,
        class_weight=class_weights,
        callbacks=callbacks_list
    )

    print(f"\n✅ Training Complete. Best model saved to {MODEL_SAVE_PATH}")


if __name__ == "__main__":
    train_ultra()
