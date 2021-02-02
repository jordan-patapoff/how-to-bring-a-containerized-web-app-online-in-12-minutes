'use strict';

const express = require('express');
const http = require('http');
const redis = require('redis');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.get('/', (req, res) => {
  res.send('Web app');
});

app.get('/redis-server-info', (req, res) => {
  const client = redis.createClient({
    host: "UPDATE_ME_AFTER_FIRST_CDK_DEPLOY" // UPDATE ME AFTER FIRST `cdk deploy`
  });
  client.on("error", function(error) {
    res.send(error);
  });
  client.on("ready", function() {
    res.send(client.server_info);
  });
});

app.get('/random-number-api-service-call', (req, res) => {
    
  const options = {
    port: 8888,
    host: 'localhost',
    method: 'GET',
    path: '/api/random-number'
  };

  http.get(options, data => {
    var body = '';
    data.on('data', (chunk) => {
      body += chunk;
    });
    data.on('end', () =>{
      res.send('GET /api/random-number ' + body);
    }).on('error', (error) => {
      res.send(error);
    });
  });

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
