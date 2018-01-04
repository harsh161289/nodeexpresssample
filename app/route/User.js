'use strict';
const _express = require('express');
const _router = _express.Router();
var UserService = require('../service/user')();

_router.post('/', (req, res) => {
	UserService.save(req.body, (user) => {
		res.json(user.omit('password'));
	});
});


module.exports = _router;
