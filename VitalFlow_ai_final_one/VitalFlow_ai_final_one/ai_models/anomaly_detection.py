
import numpy as np
from sklearn.ensemble import IsolationForest
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="VitalFlow Sentinel Anomaly Detection")

# Objective: Detect sudden demand spikes or abnormal usage patterns
# Recommended ML: Isolation Forest or Autoencoders

class StreamData(BaseModel):
    units_used: float
    time_of_day: int # 0-23
    facility_id: str

@app.post("/detect-anomaly")
async def detect_anomalies(data: List[StreamData]):
    # Preprocessing
    features = np.array([[d.units_used, d.time_of_day] for d in data])
    
    # Training (Usually pre-trained on historic baseline)
    clf = IsolationForest(contamination=0.05, random_state=42)
    predictions = clf.fit_predict(features)
    
    anomalies = []
    for i, pred in enumerate(predictions):
        if pred == -1: # Anomaly detected
            anomalies.append({
                "index": i,
                "facility": data[i].facility_id,
                "reason": "Sudden volume deviation from baseline"
            })
            
    return {
        "anomalies_detected": len(anomalies),
        "details": anomalies,
        "integrity_score": max(0, 100 - len(anomalies) * 10)
    }
