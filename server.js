var express = require('express');
	passport = require('passport');
	chatCat = require('./app');
var app = express();
//  app2 = express() app2.set('port') can be used

app.set('port', process.env.PORT || 3000);
//app.set('views', './views'); is already done in express
app.set('view engine', 'ejs');
app.set('host', config.host);

var knoxClient = knox.createClient({
	key: config.S3AccessKey,
	secret: config.S3Secret,
	bucket: config.S3Bucket
})

app.use(express.static('public')); //finds the public resources
app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());
app.use('/', chatCat.router);


var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('./routes/index.js')(io);

app.listen(app.get('port'), () => {
	console.log('ChatCAT Running on Port:', app.get('port'));
});