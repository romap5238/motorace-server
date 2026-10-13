const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.post('/login', async (req, res) => {
  const { password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM players WHERE password = $1', [password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/save', async (req, res) => {
  const { password, coins, speedLevel } = req.body;
  try {
    await pool.query(
      'UPDATE players SET coins = $1, speed_level = $2 WHERE password = $3',
      [coins, speedLevel, password]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
