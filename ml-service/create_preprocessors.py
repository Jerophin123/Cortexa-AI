"""
Script to create scaler and label_encoder if they don't exist.
This is a helper script that can be run if the preprocessors are missing.
"""
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os

def create_preprocessors():
    # Check if dataset exists
    dataset_path = "dementia_dataset.csv"
    
    if os.path.exists(dataset_path):
        print("Loading dataset to create preprocessors...")
        df = pd.read_csv(dataset_path)
        
        # Assuming the dataset has these columns
        # Adjust column names based on your actual dataset
        feature_columns = ['age', 'reaction_time_ms', 'memory_score', 
                          'speech_pause_ms', 'word_repetition_rate', 
                          'task_error_rate', 'sleep_hours']
        
        # Check which columns exist
        available_columns = [col for col in feature_columns if col in df.columns]
        
        if len(available_columns) == 7:
            X = df[feature_columns].values
            
            # Create and fit scaler
            scaler = StandardScaler()
            scaler.fit(X)
            joblib.dump(scaler, "scaler.pkl")
            print("Scaler created and saved to scaler.pkl")
            
            # Create label encoder if target column exists
            target_column = None
            for col in ['risk_label', 'risk_level', 'label', 'target']:
                if col in df.columns:
                    target_column = col
                    break
            
            if target_column:
                label_encoder = LabelEncoder()
                label_encoder.fit(df[target_column])
                joblib.dump(label_encoder, "label_encoder.pkl")
                print(f"Label encoder created and saved to label_encoder.pkl using column: {target_column}")
            else:
                # Create default label encoder
                label_encoder = LabelEncoder()
                label_encoder.fit(['low', 'medium', 'high'])
                joblib.dump(label_encoder, "label_encoder.pkl")
                print("Default label encoder created and saved to label_encoder.pkl")
        else:
            print(f"Warning: Expected 7 feature columns, found {len(available_columns)}")
            create_default_preprocessors()
    else:
        print("Dataset not found, creating default preprocessors...")
        create_default_preprocessors()

def create_default_preprocessors():
    """Create default preprocessors with reasonable ranges"""
    # Create scaler with dummy data that represents typical ranges
    dummy_data = np.array([
        [65, 300, 75, 500, 0.15, 0.1, 7.5],  # Typical values
        [70, 350, 70, 600, 0.2, 0.15, 6.5],
        [75, 400, 65, 700, 0.25, 0.2, 6.0],
        [60, 250, 80, 400, 0.1, 0.05, 8.0],
        [80, 450, 60, 800, 0.3, 0.25, 5.5],
    ])
    
    scaler = StandardScaler()
    scaler.fit(dummy_data)
    joblib.dump(scaler, "scaler.pkl")
    print("Default scaler created and saved to scaler.pkl")
    
    label_encoder = LabelEncoder()
    label_encoder.fit(['low', 'medium', 'high'])
    joblib.dump(label_encoder, "label_encoder.pkl")
    print("Default label encoder created and saved to label_encoder.pkl")

if __name__ == "__main__":
    create_preprocessors()




