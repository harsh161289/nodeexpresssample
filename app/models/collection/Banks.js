'use strict';

const _bookshelf = require('../../config/bookshelf');
const Bank = require('../bank');

var Banks = _bookshelf.Collection.extend({
	model: Bank
});

module.exports = Banks;