'use strict';

const _bookshelf = require('../../config/bookshelf');
const Contract = require('../contract');

var Contracts = _bookshelf.Collection.extend({
	model: Contract
});

module.exports = Contracts;