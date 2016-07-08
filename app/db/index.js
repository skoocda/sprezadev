'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURI);
const passportLocalMongoose = require('passport-local-mongoose');

//Log an error if the connection fails
Mongoose.connection.on('error', error => {
	console.log("MongoDV Error: ", error);
});

//Define a schema that defines the structure for storing user data
const chatUser = new Mongoose.Schema({
	profileID: String,
	fullName: String,
	profilePic: String,
});

const accountSchema = new Mongoose.Schema({
	username: String,
	password: String
});

const singleAudio = new Mongoose.Schema({
	filename:String
})

//Turn the schema into a usable model
let userModel = Mongoose.model('chatUser', chatUser);
let Account = Mongoose.model('accountSchema', accountSchema);
let singleImageModel = Mongoose.model('singleAudio', singleAudio);

module.exports = {
	Mongoose,
	passportLocalMongoose,
	userModel,
	accountModel,
	singleImageModel
}