
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('contracts', function(table) {
			table.datetime('reminderSentOn');
			table.datetime('encashmentSentOn');
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([]);
};
