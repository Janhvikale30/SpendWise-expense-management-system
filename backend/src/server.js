require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const expenseRoutes = require('./routes/expense.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'expense-management-api' }));
app.use('/api/expenses', expenseRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('MySQL connection successful.');
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Could not connect to MySQL. Check backend/.env and ensure MySQL is running.', error.message);
    process.exit(1);
  }
}

start();
