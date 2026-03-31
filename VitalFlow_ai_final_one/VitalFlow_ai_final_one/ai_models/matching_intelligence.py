
from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="VitalFlow Precision Matcher")

# Objective: Rule-based + ML hybrid for compatibility
# Rules: ABO/Rh Compatibility Matrix

COMPATIBILITY_MATRIX = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], # Universal Donor
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"] # Universal Recipient
}

class MatchRequest(BaseModel):
    patient_group: str
    unit_group: str
    component: str

@app.post("/validate-match")
async def check_compatibility(request: MatchRequest):
    # 1. Hard Rule Check
    can_receive = COMPATIBILITY_MATRIX.get(request.unit_group, [])
    is_compatible = request.patient_group in can_receive
    
    # 2. ML Confidence (Simulated)
    # In production, this considers patient antibodies/history
    confidence = 0.99 if is_compatible else 0.01
    
    return {
        "compatible": is_compatible,
        "match_confidence": confidence,
        "recommendation": "PROCEED" if is_compatible else "BLOCK_MATCH",
        "warnings": [] if is_compatible else ["Biological Incompatibility Detected"]
    }
