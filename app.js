const express = require('express');
const path = require ('path');
const bodyParser = require('body-parser');

// routes

const routes = require('./routes/api.js');

const app = express(); 

app.use('/api', routes); 

module.exports = app; 