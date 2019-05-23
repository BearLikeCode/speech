var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const basicAuth = require('basic-auth-connect');

var indexRouter = require('./routes/index');
var cloudRouter = require('./routes/cloud');
const ffmpegRouter = require('./routes/ffmpeg');
const speech = require('./routes/speech')
const mainTask = require('./routes/mainTask');

var app = express();

app.use(basicAuth('google', 'bearcoder'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/cloud', cloudRouter);
app.use('/ffmpeg', ffmpegRouter);
app.use('/speech', speech);
app.use('/main', mainTask);

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

module.exports = app;
