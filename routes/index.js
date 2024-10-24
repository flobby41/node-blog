module.exports = function(app, passport){

	var express = require('express');
	// var router = express.Router();
	
	// Function to print key/val pairs
	function getKeys(obj){
	    var keys = [];
	    for(var key in obj){
	        keys.push(key);
	        console.log(key+": "+obj[key]);
	    }
	    console.log("----------------------------");
	}

	// Passport Auth ======================================================================

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function (req, res) {
		// If user is logged in redirect them to their blogroll
		if (isLoggedInBool(req)){
		    res.redirect(307, "http://www." + req.user.username + "." + process.env.DOMAIN);
		}
		// Otherwise render home
		res.render('index', {
			title: 'Home',
			message: req.flash('errMessage')
		});
	});

	// =====================================
	// LOGIN ========
	// =====================================
	// process the login form
	app.post('/login', function(req, res, next) {
	  passport.authenticate('local-login', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { return res.redirect('/'); }
	    req.logIn(user, function(err) {
	      if (err) { return next(err); }
	      return res.redirect("http://www." + user.username + "." + process.env.DOMAIN);
	    });
	  })(req, res, next);
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// process the login form
	app.post('/signup', function(req, res, next) {
	  passport.authenticate('local-signup', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { return res.redirect('/'); }
	    req.logIn(user, function(err) {
	      if (err) { return next(err); }
	      return res.redirect("http://www." + user.username + "." + process.env.DOMAIN);
	    });
	  })(req, res, next);
	});
	
	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req,res){
		res.render('profile',{
			title: 'Profile',
			user: req.user // get the user out of session and passed to template
		});
	});

	// route middleware to make sure a user is logged in
	function isLoggedIn(req,res,next){
		// if user is authenticated in session carry on
		if (req.isAuthenticated()){
			return next();
		}
		//else redirect them to home page
		else{
			res.redirect('/');
		}
	}

	// isLoggedInBool
	// returns true or false
	function isLoggedInBool(req){
		if (req.isAuthenticated()){
			return true;
		}
		return false;
	}
// End of export
}