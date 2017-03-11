var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var flash    = require('connect-flash');
var session      = require('express-session');

/**
 * Create Express server.
 */
var app = express();


var passport = require('passport');
require('./config/passport')(passport);

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
// require('./controllers/index.js')(app, passport); // load our routes and pass in our app and fully configured passport




/* Connect to MongoDB */
// fs.readFile('.credentials.json', function processCredentials(err, content) {
//   if (err) {
//     console.log('Error loading credentials file: ' + err);
//     return;
//   };
//   // update environment with credential
//   credentials = JSON.parse(content);
//   // provess.env.MLAB_URI = credentials.MLAB_URI

//   mongoose.Promise = global.Promise;
//   mongoose.connect(credentials.MLAB_URI);
//   mongoose.connection.on('error', () => {
//     console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
//     process.exit();
//   });

// });


mongoose.Promise = global.Promise;
console.log(process.env.PROD_MONGODB);
mongoose.connect(process.env.PROD_MONGODB);



/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}))
app.set('view engine', 'hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(__dirname + "/public"));


// Load in controllers as middleware (routes)
app.use(require('./controllers'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
