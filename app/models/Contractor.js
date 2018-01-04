'use strict';
const _bookshelf = require('../config/bookshelf');
const User = require('./user');

var Contractor = _bookshelf.Model.extend({
	tableName: 'contractors'
});

module.exports = Contractor;