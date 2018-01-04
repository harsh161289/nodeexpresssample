'use strict';

const _bookshelf = require('../../config/bookshelf');
const Contractor = require('../contractor');

var Contractors = _bookshelf.Collection.extend({
	model: Contractor
});

module.exports = Contractors;