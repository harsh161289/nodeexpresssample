// Update with your config settings.
//client, host, port, user, password, poolMin, poolMax, debug
function Connection(optns) {
	this.options = optns || {};

	var createConnection = function() {
		var obj = {},
			connection = {},
			pool = {},
			migrations = {},
			seeds = {};

		obj.client = this.options.client || 'sqlite3';

		if (obj.client === "sqlite3") {
			connection.filename = "./db/bgms.sqlite"
			seeds.directory = "./db/seeds";
			obj.seeds = seeds;
		} else {
			connection.host = this.options.host;
			connection.database = 'bgms';
			connection.user = this.options.user;
			connection.password = this.options.password;

			pool.min = this.options.poolMin || 2;
			pool.max = this.options.poolMax || 10;

			obj.pool = pool;
		}
		migrations = {
			directory: './migrations'
		}

		obj.connection = connection;
		obj.debug = (this.options.debug === 'false' || this.options.debug === '0') ? false : true;
		obj.migrations = migrations

		return obj;
	}

	return createConnection();
}

module.exports = Connection;