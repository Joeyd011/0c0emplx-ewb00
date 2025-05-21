const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // assuming dashboard.html is in public/

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // for Render
});

app.post('/apply', async (req, res) => {
  const { name, discord, email, role } = req.body;

  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS applications (id SERIAL PRIMARY KEY, name TEXT, discord TEXT, email TEXT, role TEXT)'
    );

    await pool.query(
      'INSERT INTO applications (name, discord, email, role) VALUES ($1, $2, $3, $4)',
      [name, discord, email, role]
    );

    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('DB Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
