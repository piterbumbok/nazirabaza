const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'vgosti_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vgosti_db',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: process.env.DB_PORT || 5432,
});

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
  try {
    // Create cabins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cabins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price_per_night INTEGER NOT NULL,
        location VARCHAR(255),
        bedrooms INTEGER,
        bathrooms INTEGER,
        max_guests INTEGER,
        amenities TEXT[],
        images TEXT[],
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin credentials table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin credentials if not exists
    const adminCheck = await pool.query('SELECT * FROM admin_credentials WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO admin_credentials (username, password) VALUES ($1, $2)',
        ['admin', 'admin123']
      );
    }

    // Insert default cabins if table is empty
    const cabinsCheck = await pool.query('SELECT COUNT(*) FROM cabins');
    if (parseInt(cabinsCheck.rows[0].count) === 0) {
      const defaultCabins = [
        {
          name: 'Морской бриз',
          description: 'Уютный домик с видом на Каспийское море, идеальный для романтического отдыха. Просторная терраса, собственный выход к пляжу, полностью оборудованная кухня и барбекю-зона.',
          price_per_night: 5000,
          location: 'Побережье Каспийского моря',
          bedrooms: 1,
          bathrooms: 1,
          max_guests: 2,
          amenities: ['Wi-Fi', 'Кондиционер', 'Терраса', 'Барбекю', 'Прямой выход к морю'],
          images: [
            'https://images.pexels.com/photos/2351649/pexels-photo-2351649.jpeg',
            'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg',
            'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg'
          ],
          featured: true
        },
        {
          name: 'Семейный причал',
          description: 'Просторный двухэтажный домик для всей семьи. Три спальни, большая гостиная с панорамными окнами и потрясающим видом на Каспийское море.',
          price_per_night: 8500,
          location: 'Побережье Каспийского моря',
          bedrooms: 3,
          bathrooms: 2,
          max_guests: 6,
          amenities: ['Wi-Fi', 'Кондиционер', 'Стиральная машина', 'Парковка', 'Детская площадка'],
          images: [
            'https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg',
            'https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg',
            'https://images.pexels.com/photos/4450337/pexels-photo-4450337.jpeg'
          ],
          featured: true
        }
      ];

      for (const cabin of defaultCabins) {
        await pool.query(`
          INSERT INTO cabins (name, description, price_per_night, location, bedrooms, bathrooms, max_guests, amenities, images, featured)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// API Routes

// Get all cabins
app.get('/api/cabins', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cabins ORDER BY created_at DESC');
    const cabins = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pricePerNight: row.price_per_night,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      amenities: row.amenities || [],
      images: row.images || [],
      featured: row.featured
    }));
    res.json(cabins);
  } catch (error) {
    console.error('Error fetching cabins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single cabin
app.get('/api/cabins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cabins WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    const row = result.rows[0];
    const cabin = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pricePerNight: row.price_per_night,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      amenities: row.amenities || [],
      images: row.images || [],
      featured: row.featured
    };
    
    res.json(cabin);
  } catch (error) {
    console.error('Error fetching cabin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new cabin
app.post('/api/cabins', async (req, res) => {
  try {
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

    const result = await pool.query(`
      INSERT INTO cabins (name, description, price_per_night, location, bedrooms, bathrooms, max_guests, amenities, images, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [name, description, pricePerNight, location, bedrooms, bathrooms, maxGuests, amenities, images, featured]);

    const row = result.rows[0];
    const cabin = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pricePerNight: row.price_per_night,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      amenities: row.amenities || [],
      images: row.images || [],
      featured: row.featured
    };

    res.status(201).json(cabin);
  } catch (error) {
    console.error('Error creating cabin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cabin
app.put('/api/cabins/:id', async (req, res) => {
  try {
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

    const result = await pool.query(`
      UPDATE cabins 
      SET name = $1, description = $2, price_per_night = $3, location = $4, 
          bedrooms = $5, bathrooms = $6, max_guests = $7, amenities = $8, 
          images = $9, featured = $10
      WHERE id = $11
      RETURNING *
    `, [name, description, pricePerNight, location, bedrooms, bathrooms, maxGuests, amenities, images, featured, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    const row = result.rows[0];
    const cabin = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pricePerNight: row.price_per_night,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      amenities: row.amenities || [],
      images: row.images || [],
      featured: row.featured
    };

    res.json(cabin);
  } catch (error) {
    console.error('Error updating cabin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete cabin
app.delete('/api/cabins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cabins WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    res.json({ message: 'Cabin deleted successfully' });
  } catch (error) {
    console.error('Error deleting cabin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM admin_credentials WHERE username = $1 AND password = $2', [username, password]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update admin credentials
app.put('/api/admin/credentials', async (req, res) => {
  try {
    const { username, password } = req.body;
    await pool.query('UPDATE admin_credentials SET username = $1, password = $2, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [username, password]);
    res.json({ success: true, message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Error updating credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get site settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update site settings
app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await pool.query(`
        INSERT INTO site_settings (key, value) 
        VALUES ($1, $2) 
        ON CONFLICT (key) 
        DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, stringValue]);
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);