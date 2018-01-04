'use strict';
const _express = require('express');
const _router = _express.Router();
const Logger = require('../config/Logger');
const ContractorService = require('../service/contractor')();

var getParams = function(creator) {
		return {
			alsoRetrieveCount: true,
			sort: 'modifiedOn',
			order: 'desc',
			page: 1,
			pageSize: 10,
			owner: creator
		};
	},
	DUPLICATE_REOCRD = 'DUPLICATE_REOCRD',
	SYSTEM_ERROR = 'SYSTEM_ERROR';

_router.get('/', (req, res) => {
	var modal = {};
	req.query.alsoRetrieveCount = (req.query.alsoRetrieveCount === 'true') ? true : false;
	if (req.query.type === 'ALL') {
		ContractorService.findAll(req.query).then((contractors) => {
			modal.contractors = contractors;
			if (req.query.alsoRetrieveCount) {
				return ContractorService.retrieveCount(req.query);
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
		ContractorService.findAny(req.query)
			.then((contractors) => {
				res.json(contractors);
			}).catch((error) => {
				Logger.error(error);
				res.status(500).send({
					key: SYSTEM_ERROR,
					message: error
				});
			});
	} else if (req.query.type === 'VALIDATE') {
		ContractorService.findBy(req.query)
			.then((contractors) => {
				res.json(contractors);
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
		searchParams = getParams(req.body.owner);

	ContractorService.save(req.body)
		.then(() =>  {
			return ContractorService.findAll(searchParams);
		}).then((contractors) => {
			modal.contractors = contractors;
			return ContractorService.retrieveCount(searchParams);
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

_router.put('/', (req, res) => {
	var modal = {},
		searchParams = getParams(req.session ? req.session.passport.user : null);

	ContractorService.save(req.body)
		.then(() =>  {
			return ContractorService.findAll(searchParams);
		}).then((contractors) => {
			modal.contractors = contractors;
			return ContractorService.retrieveCount(searchParams);
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
			}
			res.status(500).send({
				key: SYSTEM_ERROR,
				message: error
			});
		});
});


module.exports = _router;