'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

if(process.env.NODE_ENV === 'production'){
	//Initialise session with production settings
	module.exports = session({
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: db.Mongoose.connection
		})
	});
} else {
	//Initialise session with dev settings
	module.exports = session({
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: true
	});
}