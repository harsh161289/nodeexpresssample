'use strict';

const _winston = require('winston');

const logger = new (_winston.Logger)({
	transports: [
		new (_winston.transports.Console)({ timestamp: true})
	]
});

module.exports = logger;