import pandas as pd
import joblib

bundle = joblib.load("dementia_model.pkl")

model = bundle["model"]
scaler = bundle["scaler"]
le = bundle["label_encoder"]

# Use same feature order as training
columns = [
    "age",
    "reaction_time_ms",
    "memory_score",
    "speech_pause_ms",
    "word_repetition_rate",
    "task_error_rate",
    "sleep_hours"
]

sample = pd.DataFrame([[65, 950, 60, 520, 0.32, 14, 5]], columns=columns)

sample_scaled = scaler.transform(sample)
prediction = model.predict(sample_scaled)
risk = le.inverse_transform(prediction)

print("Predicted Risk:", risk[0])
