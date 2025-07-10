import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database,
    });

  
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      );

      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price_per_day REAL NOT NULL,
        location TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER,
        admin_id INTEGER,
        action TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES listings (id),
        FOREIGN KEY (admin_id) REFERENCES users (id)
      );
    `);


    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    await db.run(
      'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)',
      ['admin', hashedPassword]
    );

   
    const sampleListings = [
      {
        title: 'Toyota Camry 2022 - Perfect for City Drives',
        description: 'A reliable and comfortable sedan perfect for business trips and city driving.',
        brand: 'Toyota',
        model: 'Camry',
        year: 2022,
        price_per_day: 45.00,
        location: 'New York, NY',
        status: 'pending'
      },
      {
        title: 'BMW X5 2021 - Luxury SUV Experience',
        description: 'Premium SUV with advanced features and spacious interior.',
        brand: 'BMW',
        model: 'X5',
        year: 2021,
        price_per_day: 85.00,
        location: 'Los Angeles, CA',
        status: 'approved'
      },
      {
        title: 'Honda Civic 2023 - Fuel Efficient Compact',
        description: 'Brand new Honda Civic with excellent fuel economy.',
        brand: 'Honda',
        model: 'Civic',
        year: 2023,
        price_per_day: 35.00,
        location: 'Chicago, IL',
        status: 'rejected'
      },
      {
        title: 'Mercedes-Benz C-Class 2022',
        description: 'Elegant and powerful sedan for special occasions.',
        brand: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2022,
        price_per_day: 75.00,
        location: 'Miami, FL',
        status: 'pending'
      }
    ];

    for (const listing of sampleListings) {
      await db.run(
        `INSERT OR IGNORE INTO listings (title, description, brand, model, year, price_per_day, location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [listing.title, listing.description, listing.brand, listing.model, listing.year, listing.price_per_day, listing.location, listing.status]
      );
    }
  }
  return db;
}
