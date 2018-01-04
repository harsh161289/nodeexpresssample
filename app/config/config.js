'use strict';

const LOCALDATE_FORMAT = 'YYYY-MM-DD',
	DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss',
	FETCH_BANK_DETAILS = ['id', 'bankName', 'address', 'city', 'state', 'ifscNumber', 'modifiedOn'],
	FETCH_CONTRACTOR_DETAILS = ['id', 'nameOfFirm', 'emailId', 'contactNumber', 'alternateNumber', 'address', 'city', 'state', 'mesRegistrationNumber', 'modifiedOn'],
	FETCH_USER = ['id', 'username', 'userRole', 'emailId'],
	FETCH_USER_CREDENTIAL = ['id', 'username', 'password', 'userRole', 'emailId'],
	FETCH_CONTRACTS = ['id', 'caNumberAndNameOfWork', 'fileNumber', 'bank', 'contractor', 'typeOfBG', 'amountOfBG', 'validityDate', 'bgNumber', 'remarks', 'modifiedOn'],
	FETCH_CONTRACTS_DETAILS = ['id', 'caNumberAndNameOfWork', 'fileNumber', 'bank', 'contractor', 'typeOfBG', 'amountOfBG', 'validityDate', 'bgNumber', 'reminderToBankStatus', 'encashmentToBankStatus', 'remarks', 'reminderSentOn', 'encashmentSentOn', 'modifiedOn'],
	SECRET_KEY = 'a4f8071f-c873-4447-8ee2',
	SYSTEM_ERROR = 'SYSTEM_ERROR',
	MAIL_FROM = 'harsh161289@bgms-services.in';

module.exports = {
	FETCH_BANK: FETCH_BANK_DETAILS,
	FETCH_CONTRACTORS: FETCH_CONTRACTOR_DETAILS,
	FETCH_USER: FETCH_USER,
	FETCH_USER_CREDENTIAL: FETCH_USER_CREDENTIAL,
	SECRET_KEY: SECRET_KEY,
	FETCH_CONTRACTS: FETCH_CONTRACTS,
	FETCH_CONTRACTS_DETAILS: FETCH_CONTRACTS_DETAILS,
	LOCALDATE_FORMAT: LOCALDATE_FORMAT,
	DATETIME_FORMAT: DATETIME_FORMAT,
	SYSTEM_ERROR: SYSTEM_ERROR,
	MAIL_FROM: MAIL_FROM
};