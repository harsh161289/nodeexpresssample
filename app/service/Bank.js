'use strict';
const Banks = require('../models/collection/banks');
const Bank = require('../models/bank');
const CONFIG = require('../config/config');

var defaultParams = {
	page: 1,
	pageSize: 10,
	sort: 'modifiedOn',
	order: 'desc'
};

var calculateOffset = (param) => {
	var params = Object.assign({}, defaultParams, param);
	params.offset = (Number(params.page) === 1) ? 0 : ((Number(params.page) - 1) * Number(params.pageSize));
	return params;
};

module.exports = function BankService(optns) {
	defaultParams = Object.assign(defaultParams, optns);
	return {
		calculateOffset: calculateOffset,
		findAny: (param) => {
			return Banks.query((qb) => {
				qb.where('bankName', 'LIKE', '%' + param.searchTxt + '%')
					.orWhere('ifscNumber', 'LIKE', '%' + param.searchTxt + '%')
					.orWhere('city', 'LIKE', '%' + param.searchTxt + '%')
					.andWhere('owner', param.owner);
			}).fetch({
				columns: CONFIG.FETCH_BANK
			});
		},
		findAll: (param) => {
			var params = calculateOffset(param);
			return Banks.query((qb) => {
				qb.where('owner', params.owner)
					.orderBy(params.sort, params.order)
					.limit(params.pageSize)
					.offset(params.offset);
			}).fetch({
				columns: CONFIG.FETCH_BANK
			});
		},
		retrieveCount: (params) => {
			return Banks.query((qb) => {
				qb.where('owner', params.owner)
					.orderBy(params.sort, params.order);
			}).count('id');
		},
		save: (params) => {
			return Bank.forge(params).save();
		}
	};
}