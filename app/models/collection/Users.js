'use strict';

const _bookshelf = require('../../config/bookshelf');
const User = require('../user');

var Users = _bookshelf.Collection.extend({
	model: User
});

module.exports = Users;