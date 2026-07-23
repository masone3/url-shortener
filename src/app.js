require('dotenv').config();
const express = require('express');
const path = require('path');
const urlRoutes = require('./routes/urlRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/', urlRoutes);

app.use(errorHandler);

module.exports = app;