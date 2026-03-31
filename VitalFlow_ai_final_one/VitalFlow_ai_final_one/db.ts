
import Database from 'better-sqlite3';
import { INITIAL_INVENTORY } from './constants';
import { InventoryItem } from './types';

const db = new Database('inventory.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    facilityName TEXT,
    city TEXT,
    bloodGroup TEXT,
    componentType TEXT,
    units INTEGER,
    lastUpdated TEXT,
    expiryDate TEXT,
    distanceKm REAL,
    status TEXT,
    category INTEGER,
    contact TEXT,
    aiInsights TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    avatar TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    userId TEXT,
    type TEXT,
    bloodGroup TEXT,
    componentType TEXT,
    units INTEGER,
    cost REAL,
    status TEXT,
    location TEXT,
    timestamp TEXT,
    facilityName TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    userId TEXT,
    userRole TEXT,
    action TEXT,
    resource TEXT,
    resourceId TEXT,
    status TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    metadata TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS hospital_inventory (
    hospitalId TEXT,
    bloodGroup TEXT,
    units INTEGER,
    lastUpdated TEXT,
    PRIMARY KEY(hospitalId, bloodGroup),
    FOREIGN KEY(hospitalId) REFERENCES users(id)
  )
`);

// Seed users FIRST (before hospital_inventory, due to foreign key constraint)
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('u1', 'John Doe', 'john@example.com', 'password123', 'PATIENT', 'https://i.pravatar.cc/150?u=u1');
  insertUser.run('a1', 'Admin User', 'admin@vitalflow.ai', 'admin123', 'SUPER_ADMIN', 'https://i.pravatar.cc/150?u=a1');
  insertUser.run('a2', 'User Admin', 'bhavanipmarbe415@gmail.com', 'admin123', 'SUPER_ADMIN', 'https://i.pravatar.cc/150?u=a2');
  insertUser.run('h1', 'City General Hospital', 'hospital@vitalflow.ai', 'hosp123', 'HOSP_ADMIN', 'https://i.pravatar.cc/150?u=h1');
  insertUser.run('d1', 'Swift Driver', 'driver@vitalflow.ai', 'drive123', 'DRIVER', 'https://i.pravatar.cc/150?u=d1');
  console.log('Database seeded with initial users.');
  console.log('Admin Credentials: admin@vitalflow.ai / admin123');
  console.log('Hospital Credentials: hospital@vitalflow.ai / hosp123');
  console.log('Driver Credentials: driver@vitalflow.ai / drive123');
  console.log('Patient Credentials: john@example.com / password123');
}

// Seed initial hospital inventory
const hospInvCount = db.prepare('SELECT COUNT(*) as count FROM hospital_inventory').get() as { count: number };
if (hospInvCount.count === 0) {
  const insertHospInv = db.prepare('INSERT INTO hospital_inventory (hospitalId, bloodGroup, units, lastUpdated) VALUES (?, ?, ?, ?)');
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const hospitals = ['h1']; // City General Hospital
  
  hospitals.forEach(hId => {
    bloodGroups.forEach(bg => {
      // Seed with some random units
      const units = Math.floor(Math.random() * 15); // 0-14 units
      insertHospInv.run(hId, bg, units, new Date().toISOString());
    });
  });
  console.log('Database seeded with initial hospital inventory.');
}

// Seed activities if empty
const activityCount = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number };
if (activityCount.count === 0) {
  const insertActivity = db.prepare(`
    INSERT INTO activities (id, userId, type, bloodGroup, componentType, units, cost, status, location, timestamp, facilityName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertActivity.run('act1', 'u1', 'PURCHASE', 'O+', 'Whole blood', 2, 1500.0, 'COMPLETED', 'Main Center', new Date(Date.now() - 86400000 * 2).toISOString(), 'City Red Cross');
  insertActivity.run('act2', 'u1', 'RESERVATION', 'A+', 'Plasma', 1, 800.0, 'PENDING', 'West Wing', new Date(Date.now() - 86400000 * 5).toISOString(), 'Nanavati Max');
  console.log('Database seeded with initial activities.');
}

// Seed data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM inventory').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO inventory (
      id, facilityName, city, bloodGroup, componentType, units, 
      lastUpdated, expiryDate, distanceKm, status, category, contact, aiInsights
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items: InventoryItem[]) => {
    for (const item of items) {
      insert.run(
        item.id,
        item.facilityName,
        item.city,
        item.bloodGroup,
        item.componentType,
        item.units,
        item.lastUpdated,
        item.expiryDate,
        item.distanceKm,
        item.status,
        item.category,
        item.contact,
        JSON.stringify(item.aiInsights)
      );
    }
  });

  insertMany(INITIAL_INVENTORY);
  console.log('Database seeded with initial inventory.');
}

export default db;
