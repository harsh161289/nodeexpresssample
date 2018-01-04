'use strict';
const _express = require('express');
const _router = _express.Router();
const _moment = require('moment');
const CONFIG = require('../config/config');
const Logger = require('../config/logger');
const ContractService = require('../service/contract')();

const SYSTEM_ERROR = 'SYSTEM_ERROR';

const defaultParams = {
	alsoRetrieveCount: true,
	sort: 'modifiedOn',
	order: 'desc',
	page: 1,
	pageSize: 10
};

_router.get('/', (req, res) => {
	var modal = {};
	if (req.query.type === 'ALL') {
		ContractService.findAll(req.query)
		.then((contracts) => {
			modal.contracts = contracts;
			if (req.query.alsoRetrieveCount) {
				return ContractService.retrieveCount(req.query);
			}
		}).then((count) => {
			modal.count = count;
			res.json(modal);
		}).catch((error) => {
			Logger.error(error);
			res.status(500).send({
				key: SYSTEM_ERROR,
				message: error
			});
		});
	} else if (req.query.type === 'ANY') {
		ContractService.findAny(req.query)
		.then((contracts) => {
			res.json(contracts);
		}).catch((error) => {
			Logger.error(error);
			res.status(500).send({
				key: SYSTEM_ERROR,
				message: error
			});
		});
	} else if (req.query.type == 'EXPIRY') {
		ContractService.findByContractExpiry(req.query)
		.then((contracts) => {
			res.json(contracts);
		}).catch((error) => {
			Logger.error(error);
			res.status(500).send({
				key: SYSTEM_ERROR,
				message: error
			});
		});
	}
});

_router.post('/', (req, res) => {
	var modal = {},
	params = Object.assign({}, defaultParams, {
		owner: req.body.owner
	});
	req.body.validityDate = _moment(req.body.validityDate).format(CONFIG.LOCALDATE_FORMAT);
	ContractService.save(req.body).then(() =>  {
		return ContractService.findAll(params);
	}).then((contracts) => {
		modal.contracts = contracts;
		return ContractService.retrieveCount(params);
	}).then((count) => {
		modal.count = count;
		res.json(modal);
	}).catch((error) => {
		Logger.error(error);
		res.status(500).send({
			key: SYSTEM_ERROR,
			message: error
		});
	});
});

_router.post('/:id/notify', (req, res) => {
	ContractService.sendNotification(req.params.id, req.body)
	.then((contract) => {
		if (! contract) {
			throw new Error('Contract not updated for email status');
		} else {
			var params = Object.assign({}, defaultParams, {
				owner: req.body.owner
			});
			return ContractService.findByContractExpiry(params);
		}

	}).then((contracts) => {
		res.json(contracts);
	}).catch((error) => {
		Logger.error(error);
		res.status(500).send({
			key: 'ERROR_EMAIL_SENT_UPDATE',
			message: error
		});
	});
});

_router.put('/:id', (req, res) => {
	var params = Object.assign({}, defaultParams, {
		type: 'EXPIRY',
		owner: req.body.modifiedBy,
		createdOn: req.body.modifiedOn
	});
	Logger.info('put params', params);
	req.body.validityDate = _moment(req.body.validityDate).format(CONFIG.LOCALDATE_FORMAT);
	ContractService.extendValidity(req.params.id, req.body)
	.then(() => {
		res.sendStatus(200);
	}).catch((error) => {
		Logger.error(error);
		res.status(500).send({
			key: SYSTEM_ERROR,
			message: error
		});
	});
});


module.exports = _router;