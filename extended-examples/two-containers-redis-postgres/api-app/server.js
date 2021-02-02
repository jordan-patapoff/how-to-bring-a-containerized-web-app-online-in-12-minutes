'use strict';

const express = require('express');
const AWS = require('aws-sdk');
const pg = require('pg');

const PORT = 8888;
const HOST = '0.0.0.0';

const app = express();

app.get('/api/healthcheck', (req, res) => {
  res.send('Successful healthcheck!');
});

app.get('/api/random-number', (req, res) => {
  var ranNum = Math.ceil(Math.random() * 100);
  res.send(ranNum.toString());
});

app.get('/api/postgres-select-version', (req, res) => {
    var secretsmanager = new AWS.SecretsManager();
    secretsmanager.getSecretValue({ SecretId: 'UPDATE_ME_AFTER_FIRST_CDK_DEPLOY' }, function(err, data) {
      if (err) {
        res.send('Unable to get secret');
      }
      else {
        var secrets = JSON.parse(data.SecretString);
        
        const client = new pg.Client({
          user: secrets.username,
          host: secrets.host,
          database: 'postgres',
          password: secrets.password,
          port: secrets.port,
          connectionTimeoutMillis: 3000
        });
        
        client.connect(err => {
          if (err) {
            res.send('connection error');
          } else {
            client.query('SELECT version();', (queryerr, queryres) => {
              client.end();
              if(queryerr) {
                res.send(queryerr);
              } else {
                res.send(queryres.rows[0]);
              }
            });
          }
        });
      }
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
