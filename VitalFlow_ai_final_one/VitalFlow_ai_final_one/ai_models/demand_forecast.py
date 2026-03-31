
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="VitalFlow Demand Forecast API")

# Objective: Forecast blood demand by hospital/component
# Recommended ML: Hybrid LSTM-Prophet (Simplified LSTM below)

class DemandData(BaseModel):
    history: List[float] # Sequence of units used per hour/day
    city: str
    component: str

def preprocess_sequence(data, window_size=24):
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(np.array(data).reshape(-1, 1))
    X = []
    for i in range(len(scaled_data) - window_size):
        X.append(scaled_data[i:i+window_size])
    return np.array(X), scaler

def build_model(window_size):
    model = Sequential([
        LSTM(64, activation='relu', input_shape=(window_size, 1), return_sequences=True),
        Dropout(0.2),
        LSTM(32, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

@app.post("/forecast")
async def forecast_demand(payload: DemandData):
    if len(payload.history) < 24:
        raise HTTPException(status_code=400, detail="Minimum 24 data points required for seasonal window.")
    
    # Mock inference logic
    window = 24
    X, scaler = preprocess_sequence(payload.history, window)
    model = build_model(window)
    
    # In production, model is pre-loaded from GCS
    # prediction_scaled = model.predict(X[-1].reshape(1, window, 1))
    # result = scaler.inverse_transform(prediction_scaled)
    
    return {
        "predicted_demand_24h": float(np.mean(payload.history) * 1.15),
        "confidence_interval": [0.85, 0.95],
        "trend": "Increasing"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
