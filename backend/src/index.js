require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Sun Prime Clay API!' });
});

app.listen(port, () => {
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});