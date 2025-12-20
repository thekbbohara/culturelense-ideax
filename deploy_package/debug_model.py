import os
import sys

# Force CPU mode
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

print(f"--- Debugging Model Loading ---")
print(f"Python: {sys.executable}")
print(f"CWD: {os.getcwd()}")

# 1. Check if file exists
model_path = "god_recognizer_nightly.keras"
if not os.path.exists(model_path):
    print(f"❌ ERROR: File '{model_path}' not found in this directory!")
    sys.exit(1)
print(f"✅ File found: {model_path}")

# 2. Try loading with tf_keras (Legacy/Compatibility)
try:
    import tf_keras
    print("\nAttempting to load with 'tf_keras'...")
    model = tf_keras.models.load_model(model_path)
    print("✅ SUCCESS! The model works with 'tf_keras'.")
    sys.exit(0)
except Exception as e:
    print(f"❌ Failed with 'tf_keras': {e}")

# 3. Try loading with standard Keras 3 (Native)
try:
    import tensorflow as tf
    print("\nAttempting to load with native 'tf.keras' (Keras 3)...")
    model = tf.keras.models.load_model(model_path)
    print("✅ SUCCESS! The model works with native 'tf.keras'.")
    print("💡 FIX: Edit main.py and change 'tf_keras.models.load_model' back to 'tf.keras.models.load_model'")
    sys.exit(0)
except Exception as e:
    print(f"❌ Failed with 'tf.keras' as well: {e}")

print("\n❌ CONCLUSION: The model file is either corrupt or incompatible with this environment.")
