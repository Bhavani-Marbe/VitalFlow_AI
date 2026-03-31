import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import db from "./db";
import { PrivacyService } from "./services/privacy";
import { UserRole } from "./types";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for browser clients (allow local frontend on port 3000)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-user-role");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Governance Middleware: Audit Logging
  const auditLogger = (req: any, res: any, next: any) => {
    const originalSend = res.send;
    const userId = req.headers['x-user-id'] || 'anonymous';
    const userRole = req.headers['x-user-role'] || UserRole.Patient;

    res.send = function (body: any) {
      const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';
      const action = req.method;
      const resource = req.path;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const timestamp = new Date().toISOString();
      const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      try {
        db.prepare(`
          INSERT INTO audit_logs (id, timestamp, userId, userRole, action, resource, status, ipAddress, userAgent)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, timestamp, userId, userRole, action, resource, status, ipAddress, userAgent);
      } catch (e) {
        console.error("Failed to log audit entry:", e);
      }

      return originalSend.apply(res, arguments as any);
    };
    next();
  };

  app.use(auditLogger);

  // RBAC Middleware
  const authorize = (roles: UserRole[]) => {
    return (req: any, res: any, next: any) => {
      const userRole = req.headers['x-user-role'] as UserRole;
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ error: "Access denied: Insufficient permissions" });
      }
      next();
    };
  };

  // Privacy Middleware: Response Masking
  const privacyGuard = (req: any, res: any, next: any) => {
    const originalJson = res.json;
    const userRole = (req.headers['x-user-role'] as UserRole) || UserRole.Patient;

    res.json = function (data: any) {
      if (data && typeof data === 'object') {
        // If it's a user object or array of users, de-identify
        if (Array.isArray(data)) {
          data = data.map(item => {
            if (item && item.email && item.role) {
              return PrivacyService.deIdentifyUser(item, userRole);
            }
            return item;
          });
        } else if (data.email && data.role) {
          data = PrivacyService.deIdentifyUser(data, userRole);
        }
      }
      return originalJson.call(this, data);
    };
    next();
  };

  app.use(privacyGuard);

  // Helper to broadcast inventory updates
  const broadcastInventoryUpdate = () => {
    try {
      const items = db.prepare('SELECT * FROM inventory').all();
      const parsedItems = items.map((item: any) => ({
        ...item,
        aiInsights: JSON.parse(item.aiInsights)
      }));
      const message = JSON.stringify({
        type: "INVENTORY_UPDATE",
        payload: parsedItems
      });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (e) {
      console.error("Failed to broadcast inventory update:", e);
    }
  };

  // WebSocket logic
  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    
    // Send initial inventory on connect
    try {
      const items = db.prepare('SELECT * FROM inventory').all();
      const parsedItems = items.map((item: any) => ({
        ...item,
        aiInsights: JSON.parse(item.aiInsights)
      }));
      ws.send(JSON.stringify({
        type: "INVENTORY_UPDATE",
        payload: parsedItems
      }));
    } catch (e) {
      console.error("Failed to send initial inventory:", e);
    }

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "SOS_TRIGGER") {
          console.log("SOS Triggered by client:", message.payload);
          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "SOS_BROADCAST",
                payload: message.payload
              }));
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    });

    ws.on("close", () => console.log("Client disconnected"));
  });

  // Background Simulation: Randomly update inventory every 10 seconds to simulate "live" data
  setInterval(() => {
    try {
      const randomItem = db.prepare('SELECT id, units FROM inventory ORDER BY RANDOM() LIMIT 1').get() as { id: string, units: number };
      if (randomItem) {
        // Randomly add or subtract 1-5 units
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const newUnits = Math.max(0, randomItem.units + change);
        db.prepare('UPDATE inventory SET units = ? WHERE id = ?').run(newUnits, randomItem.id);
        console.log(`Simulated update: Item ${randomItem.id} units changed to ${newUnits}`);
        broadcastInventoryUpdate();
      }
    } catch (e) {
      console.error("Simulation error:", e);
    }
  }, 10000);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Audit Logs API (Admin only)
  app.get("/api/audit-logs", authorize([UserRole.SuperAdmin, UserRole.BloodBankAdmin]), (req, res) => {
    try {
      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
      res.json(logs);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Auth API
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE email = ? AND password = ?').get(email, password) as any;
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/register", (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const avatar = `https://i.pravatar.cc/150?u=${id}`;
      db.prepare('INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name, email, password, role || UserRole.Patient, avatar);
      
      const user = { id, name, email, role: role || UserRole.Patient, avatar };
      res.json(user);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Activities API
  app.get("/api/activities/:userId", (req, res) => {
    const { userId } = req.params;
    try {
      const activities = db.prepare('SELECT * FROM activities WHERE userId = ? ORDER BY timestamp DESC').all(userId);
      res.json(activities);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", (req, res) => {
    const { userId, type, bloodGroup, componentType, units, cost, facilityName, status, location } = req.body;
    const timestamp = new Date().toISOString();
    const id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      db.prepare(`
        INSERT INTO activities (id, userId, type, bloodGroup, componentType, units, cost, status, location, timestamp, facilityName)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, type, bloodGroup, componentType, units, cost, status || 'COMPLETED', location || 'Main Center', timestamp, facilityName);
      res.json({ id, timestamp });
    } catch (error) {
      console.error("Failed to record activity:", error);
      res.status(500).json({ error: "Failed to record activity" });
    }
  });

  // Hospital Inventory API
  app.get("/api/hospitals/inventory", authorize([UserRole.SuperAdmin]), (req, res) => {
    try {
      const inventory = db.prepare(`
        SELECT hi.*, u.name as hospitalName 
        FROM hospital_inventory hi
        JOIN users u ON hi.hospitalId = u.id
      `).all();
      res.json(inventory);
    } catch (error) {
      console.error("Failed to fetch all hospital inventories:", error);
      res.status(500).json({ error: "Failed to fetch all hospital inventories" });
    }
  });

  app.get("/api/hospital-inventory/:hospitalId", (req, res) => {
    const { hospitalId } = req.params;
    try {
      const inventory = db.prepare('SELECT * FROM hospital_inventory WHERE hospitalId = ?').all(hospitalId);
      res.json(inventory);
    } catch (error) {
      console.error("Failed to fetch hospital inventory:", error);
      res.status(500).json({ error: "Failed to fetch hospital inventory" });
    }
  });

  app.post("/api/hospital-inventory/update", authorize([UserRole.HospitalAdmin, UserRole.SuperAdmin]), (req, res) => {
    const { hospitalId, bloodGroup, units } = req.body;
    try {
      db.prepare(`
        INSERT INTO hospital_inventory (hospitalId, bloodGroup, units, lastUpdated)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(hospitalId, bloodGroup) DO UPDATE SET
          units = excluded.units,
          lastUpdated = excluded.lastUpdated
      `).run(hospitalId, bloodGroup, units, new Date().toISOString());
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update hospital inventory:", error);
      res.status(500).json({ error: "Failed to update hospital inventory" });
    }
  });

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // AI-based nearest blood bank matching
  app.post('/api/nearest-blood-bank', (req, res) => {
    try {
      const { lat, lng, bloodGroup, componentType, units } = req.body || {};
      if (typeof lat !== 'number' || typeof lng !== 'number' || !bloodGroup || !componentType || typeof units !== 'number') {
        return res.status(400).json({ error: 'Missing required fields. lat, lng, bloodGroup, componentType, units are required.' });
      }

      const inventory = db.prepare('SELECT * FROM inventory').all() as any[];
      const candidates = inventory
        .filter(item => item.bloodGroup === bloodGroup && item.componentType === componentType && item.units >= units)
        .map(item => ({
          ...item,
          distanceKm: haversineDistance(lat, lng, item.coords?.lat ?? 0, item.coords?.lng ?? 0)
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      const fallback = inventory
        .filter(item => item.componentType === componentType && item.units >= units)
        .map(item => ({
          ...item,
          distanceKm: haversineDistance(lat, lng, item.coords?.lat ?? 0, item.coords?.lng ?? 0)
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return res.json({ primary: candidates.slice(0, 5), fallback: fallback.slice(0, 5) });
    } catch (error) {
      console.error('Failed to calculate nearest blood bank:', error);
      res.status(500).json({ error: 'Failed to calculate nearest blood bank' });
    }
  });

  // Real-time emergency alert system
  const emergencyEvents: any[] = [];

  app.post('/api/emergency-alert', (req, res) => {
    try {
      const { city, bloodGroup, severity = 'critical', details } = req.body || {};
      if (!city || !bloodGroup) {
        return res.status(400).json({ error: 'city and bloodGroup are required' });
      }
      const event = {
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        city,
        bloodGroup,
        severity,
        details: details || 'Emergency blood requirement',
        timestamp: new Date().toISOString()
      };

      emergencyEvents.unshift(event);
      // Trim to last 20
      if (emergencyEvents.length > 20) emergencyEvents.pop();

      // broadcast to websocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'EMERGENCY_ALERT', payload: event }));
        }
      });

      res.json({ success: true, event });
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      res.status(500).json({ error: 'Failed to send emergency alert' });
    }
  });

  app.get('/api/emergency-alerts', (req, res) => {
    try {
      res.json(emergencyEvents);
    } catch (error) {
      console.error('Failed to fetch emergency alerts:', error);
      res.status(500).json({ error: 'Failed to fetch emergency alerts' });
    }
  });

  // Live blood availability map data
  app.get('/api/availability-map', (req, res) => {
    try {
      const inventory = db.prepare('SELECT * FROM inventory').all();
      res.json(inventory);
    } catch (error) {
      console.error('Failed to fetch availability map:', error);
      res.status(500).json({ error: 'Failed to fetch availability map' });
    }
  });

  // Security Check: Hoarding Prevention
  const verifyHoarding = (hospitalId: string, bloodGroup: string, requestedUnits: number) => {
    const currentStock = db.prepare('SELECT units FROM hospital_inventory WHERE hospitalId = ? AND bloodGroup = ?').get(hospitalId, bloodGroup) as { units: number } | undefined;
    
    const HOARDING_THRESHOLD = 5; // If hospital has 5 or more units, they must justify or be denied
    
    if (currentStock && currentStock.units >= HOARDING_THRESHOLD) {
      return {
        allowed: false,
        reason: `Anti-Hoarding Security Alert: Your facility already has ${currentStock.units} units of ${bloodGroup}. Requests are only permitted when stock is strictly below ${HOARDING_THRESHOLD} units to ensure equitable distribution across the bio-grid. Please utilize your existing stock before requesting more.`
      };
    }
    return { allowed: true };
  };

  // Inventory API
  app.get("/api/inventory", (req, res) => {
    try {
      const items = db.prepare('SELECT * FROM inventory').all();
      const parsedItems = items.map((item: any) => ({
        ...item,
        aiInsights: JSON.parse(item.aiInsights)
      }));
      res.json(parsedItems);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory/reserve", (req, res) => {
    const { id, units } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as UserRole;

    try {
      const item = db.prepare('SELECT bloodGroup, units FROM inventory WHERE id = ?').get(id) as { bloodGroup: string, units: number };
      
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Security Check: Hoarding Prevention for Hospitals
      if (userRole === UserRole.HospitalAdmin && userId) {
        const hoardingCheck = verifyHoarding(userId, item.bloodGroup, units);
        if (!hoardingCheck.allowed) {
          return res.status(403).json({ 
            error: hoardingCheck.reason,
            securityAlert: true 
          });
        }
      }

      if (item.units >= units) {
        db.prepare('UPDATE inventory SET units = units - ? WHERE id = ?').run(units, id);
        
        // Log activity
        const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(`
          INSERT INTO activities (id, userId, type, bloodGroup, componentType, units, cost, status, location, timestamp, facilityName)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          activityId, 
          userId || 'anonymous', 
          'Reservation', 
          item.bloodGroup, 
          'Whole blood', 
          units, 
          0, 
          'Pending', 
          'Main Blood Bank', 
          new Date().toISOString(), 
          'Main Blood Bank'
        );

        broadcastInventoryUpdate(); // Broadcast change to all clients
        
        // Notify Admins about the new request
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'ADMIN_NOTIFICATION',
              payload: {
                title: 'New Blood Request',
                message: `${units} units of ${item.bloodGroup} requested by ${userId || 'anonymous'}`,
                type: 'REQUEST',
                timestamp: new Date().toISOString()
              }
            }));
          }
        });

        res.json({ success: true, activityId });
      } else {
        res.status(400).json({ error: "Insufficient units available" });
      }
    } catch (error) {
      console.error("Failed to reserve units:", error);
      res.status(500).json({ error: "Failed to reserve units" });
    }
  });

  // Blood request state and helpers (demo in-memory store)
  const bloodRequests: any[] = [
    {
      id: 'req_12345678',
      itemId: 'item_1',
      facilityName: 'City Red Cross',
      bloodGroup: 'O+',
      componentType: 'Whole blood',
      units: 2,
      status: 'INITIATED',
      deliveryMethod: 'TRANSFER',
      deliveryAddress: 'City General Hospital, Sector 4',
      locked: false,
      assignedDriver: null,
      verified: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'req_87654321',
      itemId: 'item_2',
      facilityName: 'Nanavati Max',
      bloodGroup: 'A+',
      componentType: 'Plasma',
      units: 1,
      status: 'IN_TRANSIT',
      deliveryMethod: 'TRANSFER',
      deliveryAddress: 'City General Hospital, Sector 4',
      locked: false,
      assignedDriver: 'driver_001',
      verified: true,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  app.get("/api/blood-requests", (req, res) => {
    try {
      res.json(bloodRequests);
    } catch (error) {
      console.error("Failed to fetch blood requests:", error);
      res.status(500).json({ error: "Failed to fetch blood requests" });
    }
  });

  app.post("/api/blood-requests", authorize([UserRole.HospitalAdmin, UserRole.SuperAdmin]), (req, res) => {
    try {
      const body = req.body || {};
      const facilityName = body.facilityName || body.facility_name || body.hospitalName || 'Unknown Hospital';
      const blood_group = body.blood_group || body.bloodGroup;
      const component_type = body.component_type || body.componentType || 'Whole blood';
      const units = body.units || body.units_requested;
      const delivery_address = body.delivery_address || body.deliveryAddress || '';

      if (!facilityName || !blood_group || !component_type || !units) {
        return res.status(400).json({ error: 'Missing required fields. facilityName, blood_group, component_type, units are required.' });
      }

      const newRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        itemId: `item_${Math.random().toString(36).substr(2, 6)}`,
        facilityName,
        bloodGroup: blood_group,
        componentType: component_type,
        units,
        status: 'SENT',
        deliveryMethod: 'TRANSFER',
        deliveryAddress: delivery_address || 'Not specified',
        locked: false,
        assignedDriver: null,
        verified: true,
        timestamp: new Date().toISOString()
      };
      bloodRequests.unshift(newRequest);
      return res.json({ success: true, request: newRequest });
    } catch (error) {
      console.error("Failed to create blood request:", error);
      res.status(500).json({ error: "Failed to create blood request" });
    }
  });

  app.patch("/api/blood-requests/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const request = bloodRequests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      if (request.locked) {
        return res.status(409).json({ error: 'Request is locked and cannot be modified' });
      }
      if (request.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Request already completed' });
      }
      request.status = status || request.status;
      return res.json({ success: true, request });
    } catch (error) {
      console.error("Failed to update blood request status:", error);
      res.status(500).json({ error: "Failed to update blood request status" });
    }
  });

  app.post("/api/blood-requests/:id/assign-driver", authorize([UserRole.SuperAdmin, UserRole.BloodBankAdmin]), (req, res) => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      const request = bloodRequests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      if (request.locked) {
        return res.status(409).json({ error: 'Request is locked' });
      }
      if (request.assignedDriver) {
        return res.status(409).json({ error: 'Driver already assigned' });
      }
      if (request.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Cannot assign driver to completed request' });
      }
      request.assignedDriver = driverId;
      request.status = 'IN_TRANSIT';
      return res.json({ success: true, request });
    } catch (error) {
      console.error("Failed to assign driver:", error);
      res.status(500).json({ error: "Failed to assign driver" });
    }
  });

  app.post("/api/blood-requests/:id/lock", authorize([UserRole.HospitalAdmin, UserRole.SuperAdmin]), (req, res) => {
    try {
      const { id } = req.params;
      const request = bloodRequests.find(r => r.id === id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      request.locked = true;
      return res.json({ success: true, request });
    } catch (error) {
      console.error("Failed to lock request:", error);
      res.status(500).json({ error: "Failed to lock request" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
