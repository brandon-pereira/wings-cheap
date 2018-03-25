require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config');
var requestIp = require('request-ip');

// required only to set config
var mongoose = require('mongoose');
mongoose.Promise = Promise;

console.log("\n=================\nUsing config:", config);

app.use(bodyParser.json());
app.use(requestIp.mw())
app.use(express.static('dist'));

require('./routes/deal')(app);
require('./routes/deals')(app);
require('./routes/init')(app);

app.listen(config.port);