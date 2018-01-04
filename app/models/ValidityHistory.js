'use strict';
const _bookshelf = require('../config/bookshelf');
const User = require('./user');
const Contract = require('./contract');

var Validity = _bookshelf.Model.extend({
	tableName: 'validity_history',

	contract: function() {
		return this.belongsTo(Contract, 'contract');
	}
});

module.exports = Validity;