'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('NODE How to bring a containerized web app online in 12 minutes (from start to finish)');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
