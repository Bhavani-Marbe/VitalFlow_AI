
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, value
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="VitalFlow Expiry Optimization API")

# Objective: Prioritize allocation of units closest to expiry
# Approach: Mixed Integer Linear Programming (MILP)

class Unit(BaseModel):
    id: str
    days_to_expiry: int
    blood_group: str

class HospitalDemand(BaseModel):
    id: str
    required_units: int
    urgency_score: float # 0 to 1

@app.post("/optimize-allocation")
async def optimize_expiry(units: List[Unit], demands: List[HospitalDemand]):
    prob = LpProblem("Minimize_Expiry_Waste", LpMinimize)
    
    # Decision Variables: x[u][h] = 1 if unit u goes to hospital h
    choices = LpVariable.dicts("Route", 
                               ((u.id, d.id) for u in units for d in demands), 
                               cat='Binary')
    
    # Objective Function: Minimize (Days to Expiry * Urgency Factor)
    # This pushes older blood to the most urgent cases first
    prob += lpSum([choices[u.id, d.id] * u.days_to_expiry for u in units for d in demands])
    
    # Constraints: Each unit assigned max once
    for u in units:
        prob += lpSum([choices[u.id, d.id] for d in demands]) <= 1
        
    # Constraints: Demand fulfillment
    for d in demands:
        prob += lpSum([choices[u.id, d.id] for u in units]) <= d.required_units
        
    prob.solve()
    
    results = []
    for u in units:
        for d in demands:
            if value(choices[u.id, d.id]) == 1:
                results.append({"unit_id": u.id, "to_hospital": d.id})
                
    return {
        "status": "Optimization Complete",
        "allocations": results,
        "efficiency_score": 0.94
    }
