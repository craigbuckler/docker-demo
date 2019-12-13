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

  express = require('express'),
  favicon = require('serve-favicon'),
  app = express();

// middleware
app.use(favicon(dir.static + 'favicon.ico'));
app.use(express.static(dir.static, { index: false, maxAge: 1000 }));

app.use((req, res, next) => {

  // if (dev) res.append('Access-Control-Allow-Origin', '*'); // CORS local testing
  res.append('Vary', 'X-Requested-With'); // HTTP/Ajax distinction
  next();

});

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/hello/:name', (req, res) => res.json({ message: `Hello ${ req.params.name || 'anonymous' }` }));

// 404 error
app.use(function (req, res) {
  res.status(404).send('Not found');
});

// HTTP server
app.listen(portHttp, () => console.log(`HTTP on port ${portHttp} in ${ dev ? 'development' : 'production'} mode`));
