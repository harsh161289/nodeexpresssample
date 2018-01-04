'use strict';

const _nodemailer = require('nodemailer');
const _xoauth2 = require('xoauth2');
const ClientDetails = require('../config/authorisation');
const Logger = require('../config/logger');

//create transport object using the default SMTP transport
const smtpTransport = _nodemailer.createTransport({
	service: 'gmail',
	auth: {
		xoauth2: _xoauth2.createXOAuth2Generator({
			user: ClientDetails.client,
			clientId: ClientDetails.client_id,
			clientSecret: ClientDetails.client_key,
			refreshToken: ClientDetails.refreshToken,
		})
	}
});

// listen for token updates (if refreshToken is set)
smtpTransport.on('token', function(token){
	Logger.info('New token for %s: %s', token.user, token.accessToken);
});

// send mail to  
function sendMail(sender, recepient, subject, text) {
	return smtpTransport.sendMail({
		from: ClientDetails.client,
		to: recepient,
		subject: subject,
		html: text
	});
}

module.exports = {
	sendMail: sendMail
};