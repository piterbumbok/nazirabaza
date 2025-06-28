const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting VGosti server...');
console.log('📁 Working directory:', __dirname);
console.log('🌐 Port:', PORT);

// Database connection
const dbPath = path.join(__dirname, 'database.sqlite');
console.log('💾 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
const distPath = path.join(__dirname, '../dist');
const uploadsPath = path.join(__dirname, 'uploads');

console.log('📂 Static files path:', distPath);
console.log('📸 Uploads path:', uploadsPath);

app.use(express.static(distPath));
app.use('/uploads', express.static(uploadsPath));

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
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
    console.log('🔧 Initializing database...');
    
    db.serialize(() => {
      // Create cabins table with ALL necessary fields INCLUDING map_url
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
          active BOOLEAN DEFAULT 1,
          distance_to_sea TEXT,
          map_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating cabins table:', err);
        else console.log('✅ Cabins table ready');
      });

      // Add missing columns to existing table if they don't exist
      const addColumnIfNotExists = (tableName, columnName, columnType, defaultValue = null) => {
        const defaultClause = defaultValue ? ` DEFAULT ${defaultValue}` : '';
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}${defaultClause}`, (err) => {
          // Ignore error if column already exists
          if (err && !err.message.includes('duplicate column name')) {
            console.error(`Error adding column ${columnName}:`, err);
          }
        });
      };

      // Ensure all columns exist
      addColumnIfNotExists('cabins', 'active', 'BOOLEAN', '1');
      addColumnIfNotExists('cabins', 'distance_to_sea', 'TEXT');
      addColumnIfNotExists('cabins', 'map_url', 'TEXT');

      // Create settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating settings table:', err);
        else console.log('✅ Settings table ready');
      });

      // Create admin credentials table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_credentials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating admin table:', err);
        else console.log('✅ Admin table ready');
      });

      // Create admin path table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_path (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating admin path table:', err);
        else console.log('✅ Admin path table ready');
      });

      // Create reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          approved BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating reviews table:', err);
        else console.log('✅ Reviews table ready');
      });

      // Insert default admin credentials if not exists
      db.get('SELECT * FROM admin_credentials WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('Error checking admin credentials:', err);
          return;
        }
        if (!row) {
          db.run(
            'INSERT INTO admin_credentials (username, password) VALUES (?, ?)',
            ['admin', 'admin123'],
            (err) => {
              if (err) console.error('Error creating default admin:', err);
              else console.log('✅ Default admin created (admin/admin123)');
            }
          );
        } else {
          console.log('✅ Admin credentials exist');
        }
      });

      // Insert default admin path if not exists
      db.get('SELECT * FROM admin_path WHERE path = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('Error checking admin path:', err);
          return;
        }
        if (!row) {
          db.run(
            'INSERT INTO admin_path (path) VALUES (?)',
            ['admin'],
            (err) => {
              if (err) console.error('Error creating default admin path:', err);
              else console.log('✅ Default admin path created (/admin)');
            }
          );
        } else {
          console.log('✅ Admin path exists');
        }
      });

      // Insert default cabins if table is empty
      db.get('SELECT COUNT(*) as count FROM cabins', (err, row) => {
        if (err) {
          console.error('Error checking cabins count:', err);
          return;
        }
        
        if (row.count === 0) {
          console.log('📦 Adding default cabins...');
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
              featured: 1,
              active: 1,
              distance_to_sea: '5 мин',
              map_url: ''
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
              featured: 1,
              active: 1,
              distance_to_sea: '3 мин',
              map_url: ''
            }
          ];

          defaultCabins.forEach((cabin, index) => {
            db.run(`
              INSERT INTO cabins (name, description, price_per_night, location, bedrooms, bathrooms, max_guests, amenities, images, featured, active, distance_to_sea, map_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
              cabin.featured,
              cabin.active,
              cabin.distance_to_sea,
              cabin.map_url
            ], (err) => {
              if (err) console.error(`Error adding cabin ${index + 1}:`, err);
              else console.log(`✅ Added cabin: ${cabin.name}`);
            });
          });
        } else {
          console.log(`✅ Found ${row.count} existing cabins`);
        }
        
        console.log('✅ Database initialized successfully');
        resolve();
      });
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    version: '1.0.0'
  });
});

// API Routes

// Get all cabins (only active ones for public)
app.get('/api/cabins', (req, res) => {
  console.log('📋 GET /api/cabins');
  db.all('SELECT * FROM cabins WHERE active = 1 ORDER BY created_at DESC', (err, rows) => {
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
      featured: Boolean(row.featured),
      active: Boolean(row.active),
      distanceToSea: row.distance_to_sea,
      mapUrl: row.map_url || '' // ВАЖНО: всегда возвращаем карту
    }));
    
    console.log(`✅ Returned ${cabins.length} active cabins`);
    res.json(cabins);
  });
});

// Get all cabins for admin (including inactive)
app.get('/api/admin/cabins', (req, res) => {
  console.log('📋 GET /api/admin/cabins');
  db.all('SELECT * FROM cabins ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching admin cabins:', err);
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
      featured: Boolean(row.featured),
      active: Boolean(row.active),
      distanceToSea: row.distance_to_sea,
      mapUrl: row.map_url || '' // ВАЖНО: всегда возвращаем карту
    }));
    
    console.log(`✅ Returned ${cabins.length} cabins for admin`);
    res.json(cabins);
  });
});

// Get single cabin
app.get('/api/cabins/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📋 GET /api/cabins/${id}`);
  
  db.get('SELECT * FROM cabins WHERE id = ? AND active = 1', [id], (err, row) => {
    if (err) {
      console.error('Error fetching cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      console.log(`❌ Cabin ${id} not found or inactive`);
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
      featured: Boolean(row.featured),
      active: Boolean(row.active),
      distanceToSea: row.distance_to_sea,
      mapUrl: row.map_url || '' // ВАЖНО: всегда возвращаем карту
    };
    
    console.log(`✅ Returned cabin: ${cabin.name} with map: ${cabin.mapUrl ? 'YES' : 'NO'}`);
    console.log(`🗺️ Map URL: ${cabin.mapUrl}`);
    res.json(cabin);
  });
});

// Add new cabin
app.post('/api/cabins', (req, res) => {
  console.log('➕ POST /api/cabins');
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
    featured,
    active = true,
    distanceToSea,
    mapUrl
  } = req.body;

  console.log('📍 Map URL received for new cabin:', mapUrl);

  db.run(`
    INSERT INTO cabins (name, description, price_per_night, location, bedrooms, bathrooms, max_guests, amenities, images, featured, active, distance_to_sea, map_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    active ? 1 : 0,
    distanceToSea,
    mapUrl || '' // ВАЖНО: сохраняем карту как есть
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
        featured: Boolean(row.featured),
        active: Boolean(row.active),
        distanceToSea: row.distance_to_sea,
        mapUrl: row.map_url || ''
      };

      console.log(`✅ Created cabin: ${cabin.name} with map: ${cabin.mapUrl ? 'YES' : 'NO'}`);
      console.log(`🗺️ Saved map URL: ${cabin.mapUrl}`);
      res.status(201).json(cabin);
    });
  });
});

// Update cabin
app.put('/api/cabins/:id', (req, res) => {
  const { id } = req.params;
  console.log(`✏️ PUT /api/cabins/${id}`);
  
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
    featured,
    active = true,
    distanceToSea,
    mapUrl
  } = req.body;

  console.log('📍 Map URL for update:', mapUrl);

  db.run(`
    UPDATE cabins 
    SET name = ?, description = ?, price_per_night = ?, location = ?, 
        bedrooms = ?, bathrooms = ?, max_guests = ?, amenities = ?, 
        images = ?, featured = ?, active = ?, distance_to_sea = ?, map_url = ?
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
    active ? 1 : 0,
    distanceToSea,
    mapUrl || '', // ВАЖНО: сохраняем карту как есть
    id
  ], function(err) {
    if (err) {
      console.error('Error updating cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      console.log(`❌ Cabin ${id} not found for update`);
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
        featured: Boolean(row.featured),
        active: Boolean(row.active),
        distanceToSea: row.distance_to_sea,
        mapUrl: row.map_url || ''
      };

      console.log(`✅ Updated cabin: ${cabin.name} with map: ${cabin.mapUrl ? 'YES' : 'NO'}`);
      console.log(`🗺️ Updated map URL: ${cabin.mapUrl}`);
      res.json(cabin);
    });
  });
});

// Delete cabin
app.delete('/api/cabins/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /api/cabins/${id}`);
  
  db.run('DELETE FROM cabins WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting cabin:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (this.changes === 0) {
      console.log(`❌ Cabin ${id} not found for deletion`);
      return res.status(404).json({ error: 'Cabin not found' });
    }

    console.log(`✅ Deleted cabin ${id}`);
    res.json({ message: 'Cabin deleted successfully' });
  });
});

// Reviews API

// Get all reviews (admin only)
app.get('/api/reviews', (req, res) => {
  console.log('📝 GET /api/reviews');
  db.all('SELECT * FROM reviews ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const reviews = rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      rating: row.rating,
      comment: row.comment,
      approved: Boolean(row.approved),
      created_at: row.created_at
    }));
    
    console.log(`✅ Returned ${reviews.length} reviews`);
    res.json(reviews);
  });
});

// Get approved reviews (public)
app.get('/api/reviews/approved', (req, res) => {
  console.log('📝 GET /api/reviews/approved');
  db.all('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching approved reviews:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const reviews = rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at
    }));
    
    console.log(`✅ Returned ${reviews.length} approved reviews`);
    res.json(reviews);
  });
});

// Create review
app.post('/api/reviews', (req, res) => {
  console.log('➕ POST /api/reviews');
  const { name, email, rating, comment } = req.body;

  // Simple validation
  if (!name || !email || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  db.run(`
    INSERT INTO reviews (name, email, rating, comment, approved)
    VALUES (?, ?, ?, ?, 0)
  `, [name, email, rating, comment], function(err) {
    if (err) {
      console.error('Error creating review:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Get the created review
    db.get('SELECT * FROM reviews WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created review:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const review = {
        id: row.id.toString(),
        name: row.name,
        email: row.email,
        rating: row.rating,
        comment: row.comment,
        approved: Boolean(row.approved),
        created_at: row.created_at
      };

      console.log(`✅ Created review from: ${review.name}`);
      res.status(201).json(review);
    });
  });
});

// Update review (approve/disapprove)
app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  console.log(`✏️ PUT /api/reviews/${id} - approved: ${approved}`);

  db.run('UPDATE reviews SET approved = ? WHERE id = ?', [approved ? 1 : 0, id], function(err) {
    if (err) {
      console.error('Error updating review:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      console.log(`❌ Review ${id} not found for update`);
      return res.status(404).json({ error: 'Review not found' });
    }

    // Get the updated review
    db.get('SELECT * FROM reviews WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated review:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const review = {
        id: row.id.toString(),
        name: row.name,
        email: row.email,
        rating: row.rating,
        comment: row.comment,
        approved: Boolean(row.approved),
        created_at: row.created_at
      };

      console.log(`✅ Updated review: ${review.name} - approved: ${review.approved}`);
      res.json(review);
    });
  });
});

// Delete review
app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /api/reviews/${id}`);
  
  db.run('DELETE FROM reviews WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (this.changes === 0) {
      console.log(`❌ Review ${id} not found for deletion`);
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log(`✅ Deleted review ${id}`);
    res.json({ message: 'Review deleted successfully' });
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  console.log('🔐 POST /api/admin/login');
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admin_credentials WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (row) {
      console.log(`✅ Login successful for user: ${username}`);
      res.json({ success: true, message: 'Login successful' });
    } else {
      console.log(`❌ Login failed for user: ${username}`);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Update admin credentials
app.put('/api/admin/credentials', (req, res) => {
  console.log('🔐 PUT /api/admin/credentials');
  const { username, password } = req.body;
  
  db.run('UPDATE admin_credentials SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [username, password], (err) => {
    if (err) {
      console.error('Error updating credentials:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(`✅ Admin credentials updated: ${username}`);
    res.json({ success: true, message: 'Credentials updated successfully' });
  });
});

// Get admin path
app.get('/api/admin/path', (req, res) => {
  console.log('🔗 GET /api/admin/path');
  db.get('SELECT path FROM admin_path ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error fetching admin path:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ path: row ? row.path : 'admin' });
  });
});

// Update admin path
app.put('/api/admin/path', (req, res) => {
  console.log('🔗 PUT /api/admin/path');
  const { path } = req.body;
  
  // Delete all existing paths and insert new one
  db.run('DELETE FROM admin_path', (err) => {
    if (err) {
      console.error('Error clearing admin paths:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    db.run('INSERT INTO admin_path (path) VALUES (?)', [path], (err) => {
      if (err) {
        console.error('Error updating admin path:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log(`✅ Admin path updated: /${path}`);
      res.json({ success: true, message: 'Admin path updated successfully' });
    });
  });
});

// Get site settings
app.get('/api/settings', (req, res) => {
  console.log('⚙️ GET /api/settings');
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
    
    console.log(`✅ Returned ${Object.keys(settings).length} settings`);
    res.json(settings);
  });
});

// Update site settings
app.put('/api/settings', (req, res) => {
  console.log('⚙️ PUT /api/settings');
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
        console.log(`✅ Updated ${keys.length} settings`);
        res.json({ success: true, message: 'Settings updated successfully' });
      }
    });
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('📸 POST /api/upload');
  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log(`✅ File uploaded: ${imageUrl}`);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check admin path and serve admin page
app.get('/:path', (req, res, next) => {
  const requestedPath = req.params.path;
  
  // Check if this path is an admin path
  db.get('SELECT path FROM admin_path WHERE path = ?', [requestedPath], (err, row) => {
    if (err) {
      console.error('Error checking admin path:', err);
      return next();
    }
    
    if (row) {
      // This is an admin path, serve the React app
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built. Run: npm run build');
      }
    } else {
      // Not an admin path, continue to next middleware
      next();
    }
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('❌ index.html not found at:', indexPath);
    res.status(404).send('Frontend not built. Run: npm run build');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await initDatabase();
    
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🎉 ===================================');
      console.log(`🚀 VGosti server running on port ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log('🎉 ===================================');
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        db.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        db.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();