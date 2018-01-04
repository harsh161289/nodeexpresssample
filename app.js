/* global require, __dirname, */

'use strict';

const _express = require('express');
const _app = _express();

const _bodyParser = require('body-parser');
const _path = require('path');
const _session = require('express-session');
const _cookieParser = require('cookie-parser');
const _passport = require('passport');
const UserRouter = require('./app/route/user');
const BankRouter = require('./app/route/bank');
const ContractorRouter = require('./app/route/contractor');
const ContractRouter = require('./app/route/contract');
const CONFIG = require('./app/config/config');
// const Logger = require('./app/config/logger');
const Audit = require('./app/config/audit');
require('./app/config/passport')(_passport);

_app.use(_express.static(_path.join(__dirname, 'public')));
_app.use(_bodyParser.urlencoded({
	extended: true
}));
_app.use(_bodyParser.json());
_app.use(_cookieParser());

_app.use(_session({
	secret: CONFIG.SECRET_KEY,
	resave: true,
	saveUninitialized: true
}));
_app.use(_passport.initialize());
_app.use(_passport.session());

_app.get('/BGMS/login.html', function(request, response) {
	response.sendFile(_path.join(__dirname, 'sign-in.html'));
});

_app.get(['/BGMS/', '/BGMS/index.html'], function(request, response) {
	response.sendFile(_path.join(__dirname, 'index.html'));
});

_app.post('/login', function(req, res, next) {
	_passport.authenticate('local', function(err, user, info) {
		if (err) {
			res.status(500).send('SERVER_ERROR');
		} else if (!user) {
			if (info.message == 'INVALID_USER_ID_PASSWORD') {
				res.status(404).send('INVALID_USER_ID_PASSWORD');
			} else {
				res.status(401).send('NOT_AUTHORIZED');
			}
		} else {
			req.logIn(user, function(err) {
				if (err) {
					next(err);
				}
				return res.status(200).send('SUCCESSFULL');
			});
		}
	})(req, res, next);
});

/**
 *	checks for user session present in request object
 *	which is parsed serialized and de-serialized by password API
 */
var isAuthenticated = function(req, res, next) {
	if (!req.user) {
		res.status(401).send('SESSION_EXPIRED');
	} else {
		next();
	}
};

_app.post('/logout', function(req, res) {
	req.logout();
	res.status(401).send('LOGOUT');
});

_app.use('/users', isAuthenticated, Audit, UserRouter);

_app.use('/banks', isAuthenticated, Audit, BankRouter);

_app.use('/contractors', isAuthenticated, Audit, ContractorRouter);

_app.use('/contracts', isAuthenticated, Audit, ContractRouter);

_app.listen(8081, () => {
	console.info('✔ Express server listening on port %d in %s mode', 8081, _app.get('env'));
});
