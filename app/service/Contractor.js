'use strict';
const Contractors = require('../models/collection/contractors');
const Contractor = require('../models/contractor');
const CONFIG = require('../config/config');

module.exports = function ContractorService(optns) {
	var defaultParams = Object.assign({}, {
		page: 1,
		pageSize: 10,
		sort: 'modifiedOn',
		order: 'desc'
	}, optns);

	return {
		calculateOffset: function(param) {
			var params = Object.assign({}, this.defaultParams, param);
			params.offset = (Number(params.page) === 1) ? 0 : ((Number(params.page) - 1) * Number(params.pageSize));
			return params;
		},
		findBy: function(param) {
			return Contractors.query(function(qb) {
				qb.where(param.searchFor, '=', param.value)
					.andWhere('owner', param.owner);
			}).fetch({
				columns: CONFIG.FETCH_CONTRACTORS
			});
		},
		findAny: function(param) {
			return Contractors.query(function(qb) {
				qb.where('nameoffirm', 'LIKE', '%' + param.searchTxt + '%')
					.orWhere('emailid', 'LIKE', '%' + param.searchTxt + '%')
					.orWhere('city', 'LIKE', '%' + param.searchTxt + '%')
					.andWhere('owner', param.owner);
			}).fetch({
				columns: CONFIG.FETCH_CONTRACTORS
			});
		},
		findAll: function(params) {

			var param = this.calculateOffset(params);
			return Contractors.query(function(qb) {
				qb.where('owner', param.owner)
					.orderBy(param.sort, param.order)
					.limit(param.pageSize)
					.offset(param.offset);
			}).fetch({
				columns: CONFIG.FETCH_CONTRACTORS
			});
		},
		retrieveCount: function(param) {
			return Contractor.query(function(qb) {
				qb.where('owner', param.owner)
					.orderBy(param.sort, param.order);
			}).count('id');
		},
		save: function(model) {
			return Contractor.forge(model).save();
		}
	};
};