require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// });
// const upload = multer({ storage });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.cwd()), // Save in root directory
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET with filters, search, sort, and pagination...
app.get('/api/confessions', async (req, res) => {
   try {
    const {
      page = 1,
      limit = 10,
      city,
      sex,
      ageMin,
      ageMax,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const values = [];
    let idx = 1;

    if (city) {
      whereClause += ` AND LOWER(city) LIKE LOWER($${idx++})`;
      values.push(`%${city}%`);
    }
    if (sex) {
      whereClause += ` AND sex = $${idx++}`;
      values.push(sex);
    }
    if (ageMin) {
      whereClause += ` AND age >= $${idx++}`;
      values.push(Number(ageMin));
    }
    if (ageMax) {
      whereClause += ` AND age <= $${idx++}`;
      values.push(Number(ageMax));
    }
    if (search) {
      whereClause += ` AND (LOWER(description) LIKE LOWER($${idx}) OR LOWER(city) LIKE LOWER($${idx + 1}))`;
      values.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }

    const countQuery = `SELECT COUNT(*) FROM confessions ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].count);

    const offset = (Number(page) - 1) * Number(limit);
    const orderField = ['city', 'sex', 'age', 'created_at'].includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const dataQuery = `
      SELECT * FROM confessions
      ${whereClause}
      ORDER BY ${orderField} ${orderDirection}
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(Number(limit), offset);

    const dataResult = await pool.query(dataQuery, values);

    // Prepend full URL to audio_path for frontend playback
    const confessions = dataResult.rows.map(confession => {
      if (confession.audio_path) {
        return {
          ...confession,
          audio_url: `${req.protocol}://${req.get('host')}/uploads/${confession.audio_path}`
        };
      }
      return confession;
    });

    res.json({
      confessions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    console.error('GET /api/confessions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST audio or text confession
app.post('/api/confessions', upload.single('audio'), async (req, res) => {
  console.log('POST /api/confessions');
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  const { city, sex, age, description } = req.body;
  const audioFile = req.file;

  try {
    let result;
    if (audioFile) {
      // Ensure description is never NULL
      const safeDesc = description || '';
      result = await pool.query(
        `INSERT INTO confessions
         (city, sex, age, description, audio_path)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [city, sex, age, safeDesc, audioFile.path]
      );
    } else {
      result = await pool.query(
        `INSERT INTO confessions
         (city, sex, age, description)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [city, sex, age, description]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/confessions error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/file/:filename', async (req, res) => {
  const { filename } = req.params;

  // Prevent directory traversal attacks
  if (filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(process.cwd(), filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Optionally set correct Content-Type for audio/webm, mp3, etc.
  res.sendFile(filePath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
