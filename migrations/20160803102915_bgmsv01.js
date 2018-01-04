exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function (table) {
            table.increments('id').primary();
            table.string('userName').notNullable();
            table.text('password').notNullable();
            table.enu('userRole', ['BGMS_ADMIN', 'BGMS_EXECUTIVE']).notNullable();
            table.string('emailId').notNullable();
            table.boolean('deleted').defaultTo(false);
            //audit log
            table.integer('owner').unsigned().notNullable();
            table.datetime('createdOn');
            table.integer('modifiedBy').unsigned();
            table.datetime('modifiedOn');
        }),
        knex.schema.createTable('banks', function (table) {
            table.increments('id').primary();
            table.string('bankName').notNullable();
            table.text('address').notNullable();
            table.string('city').notNullable();
            table.string('state').notNullable();
            table.string('ifscNumber');
            //audit log
            table.integer('owner').unsigned().notNullable();
            table.datetime('createdOn');
            table.integer('modifiedBy').unsigned();
            table.datetime('modifiedOn');
        }),
        knex.schema.createTable('contractors', function (table) {
            table.increments('id').primary();
            table.string('nameOfFirm').notNullable();
            table.string('emailId').notNullable();
            table.string('contactNumber');
            table.string('alternateNumber');
            table.text('address');
            table.string('city');
            table.string('state');
            table.string('mesRegistrationNumber').notNullable();
            //audit log
            table.integer('owner').unsigned().notNullable();
            table.datetime('createdOn');
            table.integer('modifiedBy').unsigned();
            table.datetime('modifiedOn');
            // foreign key constraints
            table.unique(['emailId', 'owner'],['contractor_email_owner']);
            table.unique(['mesRegistrationNumber', 'owner'],['contractor_reg_no_owner']);
        }),
        knex.schema.createTable('contracts', function (table) {
            table.increments('id').primary();
            table.string('caNumberAndNameOfWork').notNullable();
            table.string('fileNumber').notNullable();
            table.integer('bank').unsigned().notNullable();
            table.integer('contractor').unsigned().notNullable();
            table.enu('typeOfBG', ['RETENTION_MONEY', 'MOBILIZATION_ADVANCE', 'ADDITIONAL_SECURITY_DEPOSIT', 'INDIVIDUAL_SECURITY_DEPOSIT', 'PERFORMANCE_GUARANTEE', 'FINAL_BILL']).notNullable();
            table.string('amountOfBG').notNullable();
            table.date('validityDate').notNullable();
            table.string('bgNumber').notNullable().unique();
            table.boolean('reminderToBankStatus').defaultTo(false); //defaultTo 0
            table.boolean('encashmentToBankStatus').defaultTo(false); //defaultTo 0
            table.text('remarks');
            //audit log
            table.integer('owner').unsigned().notNullable();
            table.datetime('createdOn');
            table.integer('modifiedBy').unsigned();
            table.datetime('modifiedOn');
            // foreign key constraints
            table.foreign('bank').references('banks.id');
            table.foreign('contractor').references('contractors.id');
            table.unique(['caNumberAndNameOfWork', 'fileNumber', 'contractor', 'typeOfBG'], ['cardnumber_contract_details']);
        }),
        knex.schema.createTable('validity_history', function (table) { // need to confirm the relation of contract and bg_validity.
            table.increments().primary();
            table.integer('contract').notNullable().unsigned();
            table.date('date').notNullable();;
            //audit log
            table.integer('owner').unsigned().notNullable();
            table.datetime('createdOn').notNullable();
            // foreign key constraints
            table.foreign('contract').references('contracts.id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('validity_history'),
        knex.schema.dropTable('contracts'),
        knex.schema.dropTable('contractors'),
        knex.schema.dropTable('banks'),
        knex.schema.dropTable('users')
    ]);
};