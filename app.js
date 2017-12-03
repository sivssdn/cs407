var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");

var index = require('./routes/user_routes');
var authentication = require('./routes/authentication');
var vehicles = require('./routes/vehicle_routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));//to be removed on production ----------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //to allow parsing with query string library
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//intialize express sessions
app.use(session({
    key: 'user_sid',
    secret: 'sivssdn',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1200000 //20 minutes
    }
}));
// This middleware will check if user's cookie is still saved in browser and user is not set,
// then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use(function (req, res, next) {
    if(req.session.user_sid && !req.session.user){
        res.clearCookie('user_sid');
    }
    next();
});
// middleware function to check for logged-in users
var sessionChecker = function (res, req, next) {
  if(!res.session.user_sid && !res.session.user){
      res.redirect('/authentication/login');  //redirect to login page
  }
};

/*var sessionCh = function checkSession(req, res, next){
    req.session.user = 'Paras';
    console.log("--------"+req.session.user);
    req.session.destroy();
    if(req.session !== undefined)
    console.log("--++++++---"+req.session.user);
    next();
};
app.use(sessionCh);*/
//  req.session.user = user.dataValues; //SET SESSIONS
app.use('/', authentication);
app.use('/user', index);
app.use('/vehicles', vehicles);
app.use('/authentication', authentication);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
