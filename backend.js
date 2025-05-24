const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
require('dotenv').config();

const app = express();
const git = simpleGit();

app.use(bodyParser.json());
app.use(express.static('.')); // serve admin.html and other static files

const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme123';  // store this in .env and don't commit

// Middleware for admin auth
function authMiddleware(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (key && key === ADMIN_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// API: Check admin key
app.post('/api/login', (req, res) => {
  if (req.body.key === ADMIN_KEY) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// API: List pages
app.get('/api/pages', authMiddleware, (req, res) => {
  const pagesDir = path.join(__dirname, 'pages');
  fs.readdir(pagesDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ pages: files });
  });
});

// API: Get page content
app.get('/api/pages/:page', authMiddleware, (req, res) => {
  const pageFile = path.join(__dirname, 'pages', req.params.page);
  fs.readFile(pageFile, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Page not found' });
    res.json({ content: data });
  });
});

// API: Save (add/edit) page
app.post('/api/pages/:page', authMiddleware, (req, res) => {
  const pageFile = path.join(__dirname, 'pages', req.params.page);
  const content = req.body.content || '';
  fs.writeFile(pageFile, content, 'utf8', async (err) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      await git.add(pageFile);
      await git.commit(`Update page ${req.params.page}`);
      await git.push('origin', 'main');
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Git push failed: ' + e.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
});
