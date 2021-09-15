/**
  This program and the accompanying materials are made available under the terms of the
  Eclipse Public License v2.0 which accompanies this distribution, and is available at
  https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
**/

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var Zconfig
try {
  Zconfig = require("./config/Zconfig");
} catch(err) {
  console.log("Missing Zconfig.json file. Make sure it is located in the 'config' subdirectory")
  exit();
}

var useMongo = Zconfig["useMongo"];
var useProm = Zconfig["usePrometheus"];
var session = require('express-session');

const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
var ddsconfig = require("./config/Zconfig.json");

var lpar_details = ddsconfig["dds"];
var lpars = Object.keys(lpar_details);
lpar_prom = [];
lpar_mongo = [];
for(i in lpars){
    var lpar = lpars[i]
    if (ddsconfig["dds"][lpar]["usePrometheus"] === 'true'){
        lpar_prom.push(lpar);
    }
    if (ddsconfig["dds"][lpar]["useMongo"] === 'true'){
      lpar_mongo.push(lpar);
  }
}

require("./nedbAdmin");
if(lpar_mongo.length > 0){
  require('./mongoV1');
  require("./app_server/Models/db");
}
if(lpar_prom.length > 0){
  //require('./cpuRealTimeMetrics');
  require('./PromMetricsV1');
}
//require("./Eureka_conn");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
var mainRouter = require('./app_server/routes/mainRouter');
var rmf3Router = require('./app_server/routes/rmf3Router');
var rmfppRouter = require('./app_server/routes/rmfppRouter');
//var fileUploadRouter = require('./app_server/routes/fileUploadRouter');
var staticRouter = require('./app_server/routes/staticXMLRouter');
var v1Router = require('./app_server/routes/v1Router');
const { exit } = require('process');

var app = express();

/*app.listen(3090, function () {
  console.log('Example app listening on port ' + port + '!');
});*/

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  key: 'user_sid',
  secret: 'zebrarmfengine',
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 604800
  }
}));

app.use('/', mainRouter);
app.use('/rmfm3', rmf3Router);
app.use('/static', staticRouter);
//app.use('/upload', fileUploadRouter);
app.use('/rmfpp', rmfppRouter);
app.use('/v1', v1Router);

app.use(express.static('uploads'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});


module.exports = app;
