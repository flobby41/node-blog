// set up ======================================================================
// get all the tools we need
var express = require('express');
var path = require('path');
var port = process.env.PORT || 8080;
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var vhost        = require('vhost');

// Database
var mongo = require('mongodb');
var monk = require('monk');

// configuration ===============================================================
// Get DB Address from environment variable DB_URL
var db = monk(process.env.DB_URL);

require('./config/passport')(passport); // pass passport for configuration

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// setup our express application ===============================================================
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({
  secret:process.env.PASSPORT_SECRET,
  cookie:{domain:'.purplecrayon.me'}
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session


// Make our db accessible to our router
// MUST BE ABOVE ROUTES
app.use(function(req,res,next){
    req.db = db;
    next();
});

// Function to print key/val pairs
function getKeys(obj){
    var keys = [];
    for(var key in obj){
        keys.push(key);
        console.log(key+": "+obj[key]);
    }
    console.log("----------------------------");
}

// Create mini userApp for handling individual users
var userApp = express();
userApp.set('views', path.join(__dirname, 'views'));
userApp.set('view engine', 'ejs');

// Handler for the route *.purplecrayon.me
userApp.use(function(req, res, next){
  var username = req.vhost[0]; // username is the "*"
  // Get db
  var db = req.db;
  var users = db.get('userlist');

  // Check to see that username is valid
  users.findOne({'username':username},{}, function (e,user) {
    // if invalid we redirect to error page
    if (user == null){
      console.log(username+" is an invalid username");
      res.render('error', {
        message: "invalid username",
      });
    } 
    // otherwise continue to correct page
    else{
      // pretend request was for /{username}/* for file serving 
      req.originalUrl = req.url;
      req.url = '/users/' + username + req.url;
      console.log("Repackages user url: "+req.url);
      next();
    } // end else 
  });
});

// Routes

// Redirect all naked URLs to www. URLs
app.all(/.*/, function(req, res, next) {
  var host = req.header("host");
  if (host.match(/^www\..*/i)) {
    next();
  } else {
    res.redirect(301, "http://www." + host + req.url);
  }
});

app.use(vhost(/www\.([a-zA-Z0-9]+)\.purplecrayon.me/, userApp));
require('./routes/index.js')(app, passport); //load our routes and pass in our app and fully configured passport
app.use('/users', users);

app.listen(port);
console.log('The CONFIG magic happens on port ' + port);

// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;