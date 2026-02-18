import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report

# ==============================================
# 1️⃣ LOAD DATASET
# ==============================================

df = pd.read_csv("dementia_dataset.csv")

X = df.drop("risk_label", axis=1)
y = df["risk_label"]

# ==============================================
# 2️⃣ ENCODE LABELS
# ==============================================

le = LabelEncoder()
y_encoded = le.fit_transform(y)

# ==============================================
# 3️⃣ SCALE FEATURES
# ==============================================

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ==============================================
# 4️⃣ TRAIN / TEST SPLIT
# ==============================================

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y_encoded,
    test_size=0.2,
    stratify=y_encoded,
    random_state=42
)

# ==============================================
# 5️⃣ TRAIN MODEL
# ==============================================

model = RandomForestClassifier(
    n_estimators=300,
    class_weight="balanced",
    n_jobs=-1,
    random_state=42
)

model.fit(X_train, y_train)

# ==============================================
# 6️⃣ EVALUATE MODEL
# ==============================================

y_pred = model.predict(X_test)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# ==============================================
# 7️⃣ EXPORT MODEL
# ==============================================

export_bundle = {
    "model": model,
    "scaler": scaler,
    "label_encoder": le
}

joblib.dump(export_bundle, "dementia_model.pkl")

print("\nModel exported successfully as dementia_model.pkl")
