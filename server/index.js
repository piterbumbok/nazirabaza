const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Initialize database tables
async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create cabins table
      db.run(`
        CREATE TABLE IF NOT EXISTS cabins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price_per_night INTEGER NOT NULL,
          location TEXT,
          bedrooms INTEGER,
          bathrooms INTEGER,
          max_guests INTEGER,
          amenities TEXT,
          images TEXT,
          featured BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create admin credentials table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_credentials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default admin credentials if not exists
      db.get('SELECT * FROM admin_credentials WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('Error checking admin credentials:', err);
          return;
        }
        if (!row) {
          db.run(
            'INSERT INTO admin_credentials (username, password) VALUES (?, ?)',
            ['admin', 'admin123']
          );
        }
      });

      // Insert default cabins if table is empty
      db.get('SELECT COUNT(*) as count FROM cabins', (err, row) => {
        if (err) {
          console.error('Error checking cabins count:', err);
          return;
        }
        
        if (row.count === 0) {
          const defaultCabins = [
            {
              name: 'Морской бриз',
              description: 'Уютный домик с видом на Каспийское море, идеальный для романтического отдыха. Просторная терраса, собственный выход к пляжу, полностью оборудованная кухня и барбекю-зона.',
              price_per_night: 5000,
              location: 'Побережье Каспийского моря',
              bedrooms: 1,
              bathrooms: 1,
              max_guests: 2,
              amenities: JSON.stringify(['Wi-Fi', 'Кондиционер', 'Терраса', 'Барбекю', 'Прямой выход к морю']),
              images: JSON.stringify([
                'https://images.pexels.com/photos/2351649/pexels-photo-2351649.jpeg',
                'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg',
                'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg'
              ]),
              featured: 1
            },
            {
              name: 'Семейный причал',
              description: 'Просторный двухэтажный домик для всей семьи. Три спальни, большая гостиная с панорамными окнами и потрясающим видом на Каспийское море.',
              price_per_night: 8500,
              location: 'Побережье Каспийского моря',
              bedrooms: 3,
              bathrooms: 2,
              max_guests: 6,
              amenities: JSON.stringify(['Wi-Fi', 'Кондиционер', 'Стиральная машина', 'Парковка', 'Детская площадка']),
              images: JSON.stringify([
                'https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg',
                'https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg',
                'https://images.pexels.com/photos/4450337/pexels-photo-4450337.jpeg'
              ]),
              featured: 1
            }
          ];

          defaultCabins.forEach(cabin => {
            db.run(`
              INSERT INTO cabins (name, description, price_per_night, location, bedrooms, bathrooms, max_guests, amenities, images, featured)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              cabin.name,
              cabin.description,
              cabin.price_per_night,
              cabin.location,
              cabin.bedrooms,
              cabin.bathrooms,
              cabin.max_guests,
              cabin.amenities,
              cabin.images,
              cabin.featured
            ]);
          });
        }
        
        console.log('Database initialized successfully');
        resolve();
      });
    });
  });
}

// API Routes

// Get all cabins
app.get('/api/cabins', (req, res) => {
  db.all('SELECT * FROM cabins ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching cabins:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const cabins = rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pricePerNight: row.price_per_night,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
      images: row.images ? JSON.parse(row.images) : [],
      featured: Boolean(row.featured)
    }));
    
    res.json(cabins);
  });
});

// Get single cabin
app.get('/api/cabins/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM cabins WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    const cabin = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pricePerNight: row.price_per_night,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
      images: row.images ? JSON.parse(row.images) : [],
      featured: Boolean(row.featured)
    };
    
    res.json(cabin);
  });
});

// Add new cabin
app.post('/api/cabins', (req, res) => {
  const {
    name,
    description,
    pricePerNight,
    location,
    bedrooms,
    bathrooms,
    maxGuests,
    amenities,
    images,
    featured
  } = req.body;

  db.run(`
    INSERT INTO cabins (name, description, price_per_night, location, bedrooms, bathrooms, max_guests, amenities, images, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name,
    description,
    pricePerNight,
    location,
    bedrooms,
    bathrooms,
    maxGuests,
    JSON.stringify(amenities),
    JSON.stringify(images),
    featured ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Error creating cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Get the created cabin
    db.get('SELECT * FROM cabins WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created cabin:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const cabin = {
        id: row.id.toString(),
        name: row.name,
        description: row.description,
        pricePerNight: row.price_per_night,
        location: row.location,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        maxGuests: row.max_guests,
        amenities: row.amenities ? JSON.parse(row.amenities) : [],
        images: row.images ? JSON.parse(row.images) : [],
        featured: Boolean(row.featured)
      };

      res.status(201).json(cabin);
    });
  });
});

// Update cabin
app.put('/api/cabins/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    pricePerNight,
    location,
    bedrooms,
    bathrooms,
    maxGuests,
    amenities,
    images,
    featured
  } = req.body;

  db.run(`
    UPDATE cabins 
    SET name = ?, description = ?, price_per_night = ?, location = ?, 
        bedrooms = ?, bathrooms = ?, max_guests = ?, amenities = ?, 
        images = ?, featured = ?
    WHERE id = ?
  `, [
    name,
    description,
    pricePerNight,
    location,
    bedrooms,
    bathrooms,
    maxGuests,
    JSON.stringify(amenities),
    JSON.stringify(images),
    featured ? 1 : 0,
    id
  ], function(err) {
    if (err) {
      console.error('Error updating cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    // Get the updated cabin
    db.get('SELECT * FROM cabins WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated cabin:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const cabin = {
        id: row.id.toString(),
        name: row.name,
        description: row.description,
        pricePerNight: row.price_per_night,
        location: row.location,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        maxGuests: row.max_guests,
        amenities: row.amenities ? JSON.parse(row.amenities) : [],
        images: row.images ? JSON.parse(row.images) : [],
        featured: Boolean(row.featured)
      };

      res.json(cabin);
    });
  });
});

// Delete cabin
app.delete('/api/cabins/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM cabins WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    res.json({ message: 'Cabin deleted successfully' });
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admin_credentials WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (row) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Update admin credentials
app.put('/api/admin/credentials', (req, res) => {
  const { username, password } = req.body;
  db.run('UPDATE admin_credentials SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [username, password], (err) => {
    if (err) {
      console.error('Error updating credentials:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ success: true, message: 'Credentials updated successfully' });
  });
});

// Get site settings
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM site_settings', (err, rows) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  });
});

// Update site settings
app.put('/api/settings', (req, res) => {
  const settings = req.body;
  
  const keys = Object.keys(settings);
  let completed = 0;
  let hasError = false;
  
  if (keys.length === 0) {
    return res.json({ success: true, message: 'Settings updated successfully' });
  }
  
  keys.forEach(key => {
    const value = settings[key];
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
    db.run(`
      INSERT OR REPLACE INTO site_settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, stringValue], (err) => {
      if (err && !hasError) {
        hasError = true;
        console.error('Error updating settings:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      completed++;
      if (completed === keys.length && !hasError) {
        res.json({ success: true, message: 'Settings updated successfully' });
      }
    });
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();