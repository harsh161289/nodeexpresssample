'use strict';
const _moment = require('moment');
const _pug = require('pug');
const _path = require('path');
const Contract = require('../models/contract');
const Contracts = require('../models/collection/contracts');
const ValidityHistory = require('../models/validityhistory');
const CONFIG = require('../config/config');
const EmailService = require('./emailService');
const Logger = require('../config/logger');


var defaultParams = {
		page: 1,
		pageSize: 10,
		sort: 'modifiedOn',
		order: 'desc'
	},
	calculateOffset = (param) => {
		var params = Object.assign({}, defaultParams, param);
		params.offset = (Number(params.page) === 1) ? 0 : ((Number(params.page) - 1) * Number(params.pageSize));
		return params;
	},
	findById = (id) => {
		return Contract.forge({
			id: id
		}).fetch({
			columns: CONFIG.FETCH_CONTRACTS
		});
	},
	updateContract = (id, model) => {
		return Contract.forge({
			id: id
		}).save(model);
	},
	updateHistory = (id, validityDate, model) => {
		return ValidityHistory.forge({
			contract: id,
			date: validityDate,
			owner: model.owner,
			createdOn: model.createdOn
		}).save();
	},
	isSendMailRequestValid = (validityDate, type, reminderToBankStatus) => {
		var todaysDate = _moment();
		if (_moment(validityDate).subtract(30, 'days').isAfter(todaysDate.toDate())) {
			if (_moment(validityDate).subtract(30, 'days').diff(todaysDate, 'days') < 4 && type === 'EXTEND' && !reminderToBankStatus) {
				return true;
			}
		} else if (_moment(validityDate).subtract(30, 'days').isBefore(todaysDate.toDate())) {
			if (type === 'EXTEND') {
				return true;
			} else if (_moment(validityDate).subtract(15, 'days').isAfter(todaysDate.toDate())) {
				if (_moment(validityDate).subtract(15, 'days').diff(todaysDate, 'days') < 4 && type === 'ENCASH') {
					return true;
				}
			} else {
				// todays date is after 15 days
				if (type === 'ENCASH') {
					return true;
				}
			}

		}
	},
	getHtmlTemplate = (templateName) => {
		return _pug.compileFile(_path.join(__dirname, '../route/template/' + templateName + '.pug'));
	},
	findByIdWithReference = (id) => {
		return Contract.forge({
			id: id
		}).fetch({
			columns: CONFIG.FETCH_CONTRACTS,
			withRelated: ['bank', 'contractor']
		});
	},
	findAny = (param) => {
		return Contracts.query((qb) => {
			qb.where('caNumberAndNameOfWork', 'LIKE', '%' + param.searchTxt + '%')
			.orWhere('fileNumber', 'LIKE', '%' + param.searchTxt + '%')
			.orWhere('bgNumber', 'LIKE', '%' + param.searchTxt + '%')
			.andWhere('owner', '=', param.owner);
		}).fetch({
			columns: CONFIG.FETCH_CONTRACTS
		});
	},
	findAll = (param) => {
		var params = calculateOffset(param);
		return Contracts.query((qb) => {
			qb.where('owner', param.owner)
			.orderBy(params.sort, params.order)
			.limit(params.pageSize)
			.offset(params.offset);
		}).fetch({
			columns: CONFIG.FETCH_CONTRACTS,
			withRelated: ['bank', 'contractor']
		});
	},
	retrieveCount = (params) => {
		return Contracts.query((qb) => {
			qb.where('owner', params.owner)
			.orderBy(params.sort, params.order);
		}).count('id');
	},
	save = (model) => {
		return Contract.forge(model).save();
	},
	extendValidity = (id, model) => {
		return findById(id)
		.then((contract) => {
			if (!contract) {
				throw new Error('contract doesnot exist for id:' + id);
			}
			return updateHistory(id, contract.get('validityDate'), {
				owner: model.modifiedBy,
				createdOn: model.modifiedOn
			});
		}).then(() => {
			return updateContract(id, {
				validityDate: model.validityDate,
				modifiedOn: _moment().format(CONFIG.DATETIME_FORMAT),
				modifiedBy: model.owner,
				reminderToBankStatus: false,
				encashmentToBankStatus: false
			});
		});
	},
	findByContractExpiry = (param) => {
		return Contracts.query((qb) => {
			qb.where('owner', param.owner)
			.whereBetween('validityDate', [_moment().format(CONFIG.LOCALDATE_FORMAT), _moment().add(60, 'day').format(CONFIG.LOCALDATE_FORMAT)]);
		}).fetch({
			columns: CONFIG.FETCH_CONTRACTS_DETAILS,
			withRelated: ['bank', 'contractor']
		});
	};

module.exports = function ContractService(optns) {
	defaultParams = Object.assign(defaultParams, optns);

	return {
		calculateOffset: calculateOffset,
		findById: findById,
		updateContract: updateContract,
		updateHistory: updateHistory,
		findByIdWithReference: findByIdWithReference,
		findAny: findAny,
		findAll: findAll,
		retrieveCount: retrieveCount,
		save: save,

		// updates the contract validity date and moves the old validity to validity history table
		extendValidity: extendValidity,
		
		// find contracts whose validity is about to expire in next 30 days
		findByContractExpiry: findByContractExpiry,
		
		// send an email notification to contract emailId followed by updates to contract status
		sendNotification: (id, params) => {
			var formattedMessage = getHtmlTemplate(params.type.toLowerCase());
			return findByIdWithReference(id).then((contract) => {
				var isValid = isSendMailRequestValid(contract.get('validityDate'), params.type, contract.reminderToBankStatus);
				if (isValid) {
					// send email
					return EmailService.sendMail(CONFIG.MAIL_FROM, contract.related('contractor').get('emailId'), params.type, formattedMessage({
						type: params.type.toLowerCase(),
						fileNumber: contract.get('fileNumber'),
						bgNumber: contract.get('bgNumber'),
						validityDate: _moment(contract.get('validityDate')).format(CONFIG.LOCALDATE_FORMAT).toString(),
						caNumberAndNameOfWork: contract.get('caNumberAndNameOfWork')
					}))
					.then(() => {
						var updateParams;
						if ('ENCASH' === params.type) {
							updateParams = Object.assign({}, params, {
								encashmentToBankStatus: true,
								encashmentSentOn: _moment().format(CONFIG.DATETIME_FORMAT)
							});
						} else if ('EXTEND' === params.type) {
							updateParams = Object.assign({}, params, {
								reminderToBankStatus: true,
								reminderSentOn: _moment().format(CONFIG.DATETIME_FORMAT),
							});
						}
						delete updateParams.type;
						return updateContract(id, updateParams);
					})
					.catch((err) => {
						Logger.error(err);
						throw new Error('EMAIL_ERROR');
					});
				}
			});
		}
	};
}