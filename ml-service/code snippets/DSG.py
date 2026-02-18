import numpy as np
import pandas as pd

np.random.seed(42)

# ---------------------------------------------------
# Generate One Patient Record
# ---------------------------------------------------
def generate_patient(risk_level):

    if risk_level == "low":
        age = np.random.randint(40, 65)
        neuro_factor = np.random.uniform(0.0, 0.35)

    elif risk_level == "medium":
        age = np.random.randint(50, 75)
        neuro_factor = np.random.uniform(0.35, 0.7)

    else:  # high
        age = np.random.randint(60, 85)
        neuro_factor = np.random.uniform(0.7, 1.0)

    # Add biological variability
    neuro_factor += np.random.normal(0, 0.05)
    neuro_factor = np.clip(neuro_factor, 0, 1)

    reaction_time = np.random.normal(650 + neuro_factor * 450, 70)
    memory_score = np.random.normal(95 - neuro_factor * 55, 7)
    speech_pause = np.random.normal(180 + neuro_factor * 380, 45)
    repetition_rate = np.random.normal(0.03 + neuro_factor * 0.4, 0.03)
    task_error = np.random.normal(4 + neuro_factor * 12, 1.8)
    sleep_hours = np.random.normal(7.5 - neuro_factor * 3.5, 0.7)

    return [
        int(age),
        round(reaction_time, 2),
        round(memory_score, 2),
        round(speech_pause, 2),
        round(max(0, repetition_rate), 3),
        round(max(0, task_error), 2),
        round(max(3, sleep_hours), 2),
        risk_level
    ]


# ---------------------------------------------------
# Generate Large Dataset
# ---------------------------------------------------
def generate_large_dataset(total_samples=40000, filename="cortexa_40000_dataset.csv"):

    columns = [
        "age",
        "reaction_time_ms",
        "memory_score",
        "speech_pause_ms",
        "word_repetition_rate",
        "task_error_rate",
        "sleep_hours",
        "risk_label"
    ]

    data = []

    # Realistic prevalence distribution
    n_low = int(total_samples * 0.70)
    n_medium = int(total_samples * 0.20)
    n_high = int(total_samples * 0.10)

    print("Generating data...")

    for _ in range(n_low):
        data.append(generate_patient("low"))

    for _ in range(n_medium):
        data.append(generate_patient("medium"))

    for _ in range(n_high):
        data.append(generate_patient("high"))

    df = pd.DataFrame(data, columns=columns)

    # Shuffle dataset
    df = df.sample(frac=1).reset_index(drop=True)

    # Save CSV
    df.to_csv(filename, index=False)

    print("Dataset successfully saved as:", filename)
    print("Total Samples:", len(df))
    print("\nClass Distribution:")
    print(df["risk_label"].value_counts())

    return df


# ---------------------------------------------------
# Run Generator
# ---------------------------------------------------
if __name__ == "__main__":
    generate_large_dataset(4000000)
