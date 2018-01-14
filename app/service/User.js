'use strict';
const _bcrypt = require('bcrypt-nodejs');
const CONFIG = require('../config/config');
const Users = require('../models/collection/users');
const User = require('../models/user');

var calculateOffset = (param) => {
		params.offset = (Number(params.page) === 1) ? 0 : ((Number(params.page) - 1) * Number(params.pageSize));
		return params;
	},
	findById = (id, cb) => {
		User.forge({
			'id': id
		}).fetch({
			columns: CONFIG.FETCH_USER
		}).then((user) => {
			var error;
			if (null == user) {
				error = new Error('User not found for user id:' + id);
			}
			cb(error, user);
		});
	},
	findByUsername = (username, cb) => {
		User.forge({
			'username': username
		}).fetch({
			columns: CONFIG.FETCH_USER
		}).then((user) => {
			if (null == user) {
				throw new Error('User not found for username:' + username);
			}
			cb(user);
		});
	},
	login = (username, password, cb) => {
		User.forge({
			'username': username
		}).fetch({
			columns: CONFIG.FETCH_USER_CREDENTIAL
		}).then((user) => {
			if (null == user) {
				cb(false, false);
			} else {
				_bcrypt.compare(password, user.get('password'), (err, result) => {
					if (result) {
						findByUsername(username, (user) => {
							cb(err, user);
						});
					} else {
						cb(new Error('Invalid credential for username ' + username), null);
					}
				})
			}
		});
	},
	save = (user, cb) => {
		if (user) {
			_bcrypt.hash(user.password, null, null, (err, result) => {
				if (err) {
					throw new Error('ERROR at bcrypt module, please check the logs!');
				}

				user.password = result;
				User.forge({}).save(user).then(function(user) {
					cb(user);
				});
			});
		}
	},
	findAll = () => {
		var params = calculateOffset(param);

		Users.query((qb) => {
			qb.where({
				'owner': 1
			}).limit(params.pageSize).offset(params.offset);
		}).fetch({
			columns: CONFIG.FETCH_USER
		}).then((users) => {
			if (param.alsoRetrieveCount) {
				Users.query(function(qb) {
					qb.where({
							'owner': 1
						})
						.orderBy(params.sort, params.order);
				}).count('id').then(function(count) {
					next({
						users: users,
						count: count
					});
				});
			} else {
				next({
					users: users
				});
			}
		});
	};



module.exports = function UserService(opts) {
	var defaultParams = opts || {};

	return {
		calculateOffset: calculateOffset,

		findById: findById,

		findByUsername: findByUsername,

		login: login,

		save: save,

		findAll: findAll
	};
};