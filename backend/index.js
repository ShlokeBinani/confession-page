require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Files save in the root directory on Render
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.cwd()), 
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET Confessions - This creates the correct WEB LINK
app.get('/api/confessions', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const dataResult = await pool.query(
      'SELECT * FROM confessions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [Number(limit), offset]
    );

    const confessions = dataResult.rows.map(confession => {
      if (confession.audio_path) {
        return {
          ...confession,
          // This creates a link like https://your-backend.com/api/file/filename.webm
          audio_url: `https://${req.get('host')}/api/file/${confession.audio_path}`
        };
      }
      return confession;
    });

    res.json({ confessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Confessions - This saves ONLY the filename
app.post('/api/confessions', upload.single('audio'), async (req, res) => {
  const { city, sex, age, description } = req.body;
  const audioFile = req.file;

  try {
    const result = await pool.query(
      `INSERT INTO confessions (city, sex, age, description, audio_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [city, sex, age, description || '', audioFile ? audioFile.filename : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve the actual audio files
app.get('/api/file/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));