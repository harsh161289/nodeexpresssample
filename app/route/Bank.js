'use strict';
const _express = require('express');
const _router = _express.Router();
const Logger = require('../config/Logger');
const BankService = require('../service/bank')();

const SYSTEM_ERROR = 'SYSTEM_ERROR',
	DUPLICATE_REOCRD = 'DUPLICATE_REOCRD';

var getParams = function(creator) {
	return {
		alsoRetrieveCount: true,
		sort: 'modifiedOn',
		order: 'desc',
		page: 1,
		pageSize: 10,
		owner: creator
	};
};

_router.get('/', (req, res) => {
	var modal = {};
	req.query.alsoRetrieveCount = (req.query.alsoRetrieveCount === 'true') ? true : false;
	if (req.query.type === 'ALL') {
		BankService.findAll(req.query)
			.then((banks) => {
				modal.banks = banks;
				if (req.query.alsoRetrieveCount) {
					return BankService.retrieveCount(req.query);
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
		BankService.findAny(req.query)
			.then((banks) => {
				res.json(banks);
			}).catch((error) => {
				Logger.error(error);
				res.status(500).send({
					key: SYSTEM_ERROR,
					message: error
				});
			});
	}

});

_router.post('/', function(req, res) {
	var modal = {},
		searchParams = getParams(req.body.owner);

	BankService.save(req.body).then(() => {
		return BankService.findAll(searchParams);
	}).then((banks) => {
		modal.banks = banks;
		return BankService.retrieveCount(searchParams);
	}).then((count) => {
		modal.count = count;
		res.json(modal);
	}).catch((error) => {
		Logger.error(error);
		if (error.code === 'ER_DUP_ENTRY') {
			res.status(409).send({
				key: DUPLICATE_REOCRD,
				message: error
			});
		} else {
			res.status(500).send({
				key: SYSTEM_ERROR,
				message: error
			});
		}
	});
});

_router.put('/', function(req, res) {
	var model = {},
		searchParams = getParams(req.session ? req.session.passport.user : null);

	BankService.save(req.body)
		.then(() => {
			return BankService.findAll(searchParams);
		}).then((banks) => {
			model.banks = banks;
			return BankService.retrieveCount(searchParams);
		}).then((count) => {
			model.count = count;
			res.json(model);
		}).catch((error) => {
			Logger.error(error);
			if (error.code === 'ER_DUP_ENTRY') {
				res.status(409).send({
					key: DUPLICATE_REOCRD,
					message: error
				});
			}
			res.status(500).send({
				key: SYSTEM_ERROR,
				message: error
			});
		});
});


module.exports = _router;