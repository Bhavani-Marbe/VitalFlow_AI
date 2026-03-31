
import networkx as nx
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="VitalFlow Logistics Graph Optimizer")

# Objective: Balance regional supply and demand using Network Flow
# Recommended: Min-Cost Max-Flow

class Node(BaseModel):
    id: str
    supply: int # Positive for supply, negative for demand

class Edge(BaseModel):
    source: str
    target: str
    capacity: int
    cost: int # Distance or transport time

@app.post("/optimize-routes")
async def redistribution_engine(nodes: List[Node], edges: List[Edge]):
    G = nx.DiGraph()
    
    for node in nodes:
        G.add_node(node.id, demand=-node.supply) # NetworkX uses negative for supply
        
    for edge in edges:
        G.add_edge(edge.source, edge.target, capacity=edge.capacity, weight=edge.cost)
        
    try:
        # Optimization logic
        flow_dict = nx.min_cost_flow(G)
        
        recommendations = []
        for u, flows in flow_dict.items():
            for v, flow_value in flows.items():
                if flow_value > 0:
                    recommendations.append({
                        "from": u,
                        "to": v,
                        "units_to_move": flow_value
                    })
                    
        return {
            "routes": recommendations,
            "status": "Balanced",
            "logistics_cost_index": sum(d['weight'] for u, v, d in G.edges(data=True))
        }
    except Exception as e:
        return {"status": "Imbalance Unsolvable", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
