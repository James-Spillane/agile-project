// app.js
const express = require('express');
const path = require('path');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const apiRouter   = require('./routes/api');   // <-- add this

const app = express();

// views & static
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());                       // <-- needed for POST JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/api', apiRouter);                    // <-- mount /api routes

// 404 (must be last)
app.use((req, res) => res.status(404).render('error', { title: 'Not Found' }));

module.exports = app;
