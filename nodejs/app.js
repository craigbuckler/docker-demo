#!/usr/bin/env node

'use strict';

const
  dev = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
  portHttp = 3000,

  // main directories
  dir = global.dir = {
    base: __dirname + '/',
    lib: __dirname + '/lib/',
    routes: __dirname + '/routes/',
    views: __dirname + '/views/',
    static: __dirname + '/static/'
  },

  mysql = require('mysql2/promise'),
  db = mysql.createPool({
    host: 'mysql',
    user: 'dbusr',
    password: 'dbpass',
    database: 'test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }),

  express = require('express'),
  app = express();

// middleware (compression and favicon handled by NGINX)
app.use(express.static(dir.static, { index: false, maxAge: 1000 }));

app.use((req, res, next) => {

  if (dev) res.append('Access-Control-Allow-Origin', '*'); // CORS local testing
  res.append('Vary', 'X-Requested-With'); // HTTP/Ajax distinction
  next();

});

// NGINX overrides this route
app.get('/', (req, res) => res.send('Hello World!'));

// simple web service
app.get('/hello/:name', (req, res) => res.json({ message: `Hello ${ req.params.name || 'anonymous' }` }));

// fetch all user records
app.get('/user/', async (req, res) => {

  const [rec] = await db.query('SELECT * FROM `user`;');
  res.json(rec);

});

// fetch user by ID
app.get('/user/:id', async (req, res) => {

  const [rec] = await db.execute('SELECT * FROM `user` WHERE `id` = ?', [ req.params.id ]);
  res.json(rec && rec.length ? rec[0] : null);

});

// 404 error
app.use(function (req, res) {
  res.status(404).send('Not found');
});

// HTTP server
app.listen(portHttp, () => console.log(`HTTP on port ${portHttp} in ${ dev ? 'development' : 'production'} mode`));
