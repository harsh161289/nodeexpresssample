# nodeexpresssample

Sample application build to perform CRUD operations, send out mails using nodemailer with custom template
	Node + express + Bookshelf + Passportjs
	nodemailer + xoauth2
	AngularJs 1.5

## Getting started
Clone the repository and navigate and type the following commands
1. Apply migration changes present under app->migration files
```
	knex migrate:latest
```


2. Run application
```
	npn run start
```
This will initialize application using sqlite3 by default, unless you want to point to any db
Inorder to link db set the path for following variables and start the application
	CLIENT(mysql/postgress/oracle), HOST, USER(DB User), PASSWORD(DB passwrd), DEBUG(true/false)


## Todo
 - Error handling at client sie
 - configuration for node mailer v4 to send mails with custom template
 - Entity validation at client side
 - packaging with webpack
 
