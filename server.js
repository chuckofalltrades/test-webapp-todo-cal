require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cache-Control for HTML pages (no-cache for PWA navigation)
app.use((req, res, next) => {
  if (req.path === '/' || req.path.startsWith('/todos') || req.path.startsWith('/calendar') || req.path.startsWith('/tags')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const router = require('./routes/index');
app.use('/', router);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
