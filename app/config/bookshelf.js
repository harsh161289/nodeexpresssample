var options = {};
options.client = process.env.CLIENT || 'mysql';
options.host = process.env.HOST || 'localhost';
options.user = process.env.USER || 'root';
options.password = process.env.PASSWORD;
options.debug = process.env.DEBUG || false;
const connection = require('../../connection')(options);

const _knex = require('knex')(connection);
if (connection) {
	_knex.migrate.latest()
		.then(function() {
			return _knex('users').where(`id`, 1).select(`id`);
		}).then(function(count) {
			if (connection.client === "sqlite3" && !count.length) {
				console.log("seeding for sqlite3");
				_knex.seed.run();
			}
		});
}

const _bookshelf = require('bookshelf')(_knex);
const getBookshelf = function() {
	return _bookshelf;
};
module.exports = getBookshelf();