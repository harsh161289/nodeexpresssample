
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({id: 1, userName: 'admin', password: '$2a$06$NbU0cf11MMa/AxVKdFzCmODccaof7TlIC5RVdvr6gfiLzCE9zGGku', userRole: 'BGMS_ADMIN', emailId: 'harsh161289@gmail.com', deleted: false, owner: 1})
      ]);
    });
};
