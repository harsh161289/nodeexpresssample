'use strict';
const _bookshelf = require('../config/bookshelf');
const User = require('./user');
const Contractor = require('./contractor');
const Bank = require('./bank');
const ValidityHistory = require('./validityhistory');

var Contract = _bookshelf.Model.extend({
	tableName: 'contracts',
    
	validity: function() {
		return this.hasMany(ValidityHistory);
	},
	contractor: function() {
		return this.belongsTo(Contractor, 'contractor');
	},
	bank: function () {
		return this.belongsTo(Bank, 'bank');
	}
});

module.exports = Contract;