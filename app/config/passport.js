'use strict';

const _localStrategy = require('passport-local').Strategy;
var UserServiceFn = require('../service/user')
var UserService = new UserServiceFn();
console.log("UserService");
console.log(UserService);
module.exports = function(passport) {
	passport.use(new _localStrategy(
		function(username, password, done) {
			UserService.login(username, password, function(err, user) {
				if (err) {
					done(null, false, {message: err.message});
				} else if (! user) {
					done(null, false, {message: 'INVALID_USER_ID_PASSWORD'});
				} else {
					done(null, user);
				}
			});
		}
	));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		UserService.findById(id, function(err, user) {
			if (!user) {
				done(err, false, {message: 'SESSION_ERROR'});
			} else {
				done(err, user);
			}	
		});
	});

};

