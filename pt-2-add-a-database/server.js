'use strict';
const express = require('express');
const AWS = require('aws-sdk');
const pg = require('pg');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
    var secretsmanager = new AWS.SecretsManager();
    secretsmanager.getSecretValue({ SecretId: 'replace-with-CfnOutput-RDSSecretsManagerSecretId-value' }, function(err, data) {
      if (err) {
        res.send('Unable to get secret');
      }
      else {
        console.log("got back the secrets");

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
            console.error('connection error', err.stack)
            res.send('connection error');
          } else {
            
            console.log('connected')
            
            client.query('SELECT NOW()', (queryerr, queryres) => {
              console.log(queryerr, queryres)
              
              client.end();
              
              if(queryerr) {
                res.send(queryerr);
              } else {
                res.send(queryres.rows[0].now);
              }
              
            });
        
          }
        });
        
      }
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
