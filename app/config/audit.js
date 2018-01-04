'use strict';
const _moment = require('moment');
const CONFIG = require('./config');

/**
 * Audit class instance to infuse the audit details into request params or prequest body
 */
const Audit = function(req, res, next) {
	if ('GET' === req.method) {
		Object.assign(req.query, {
			'owner': req.session ? req.session.passport.user : null
		});
		next();
	}

	if ('POST' === req.method) {
		Object.assign(req.body, {
			'owner': req.session ? req.session.passport.user : null,
			'createdOn': _moment().format(CONFIG.DATETIME_FORMAT),
			'modifiedBy': req.session ? req.session.passport.user : null,
			'modifiedOn': _moment().format(CONFIG.DATETIME_FORMAT)
		});
		next();
	}

	if (['PUT', 'DELETE'].indexOf(req.method) !== -1) {
		Object.assign(req.body, {
			'modifiedBy': req.session ? req.session.passport.user : null,
			'modifiedOn': _moment().format(CONFIG.DATETIME_FORMAT)
		});
		next();
	}
};

module.exports = Audit;