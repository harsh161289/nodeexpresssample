'use strict';
const _bookshelf = require('../config/bookshelf');

var User = _bookshelf.Model.extend({
	tableName: 'users'
});

module.exports = User;