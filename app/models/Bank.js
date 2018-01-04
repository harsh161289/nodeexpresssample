'use strict';
const _bookshelf = require('../config/bookshelf');
const User = require('./user');

var Bank = _bookshelf.Model.extend({
	tableName: 'banks'
});

module.exports = Bank;