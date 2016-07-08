var h = require('../helpers'),
	passport = require('passport'),
	account = require('../db')
	fs = require('fs'),
	os = require('os');

var Socket;


module.exports = (io) => {

	io.on('connection', function(socket){
		Socket = socket;
	})

	let routes = {
		'get': {
			'/': (req,res,next) => {
				res.render('login');
			},
			'/rooms': (req,res,next) => {
				res.render('rooms');
			},
			'/chat': (req,res,next) => {
				res.render('chatroom');
			},
			'/getsession': (req,res,next) => {
				res.send("My favourite colour: " + req.session.favColour);
			},
			'/setsession': (req,res,next) => {
				req.session.favColour = "Red";
				res.send("Session Set");
			},
			'/register': (req,res,next) => {
				res.render('register', {});
			},
			'/login': (req,res,next) => {
				res.render('login', { user : req.user })
			},
			'/logout': (req,res,next) => {
				res.logout();
				res.redirect('/')
			},
			'/getaudio': (req,res,next) => {
				singleAudioModel.find({}, null, {sort:{votes:-1}}, function(err, result){
					res.send(JSON.stringify(result));
				})
			}

		},
		'post': { //note these are not done
			'/register': (req,res,next ) => {
				account.register(new Account({username: req.body.username}), req.body.password, function(err){
					if(err){
						console.log('User registration error');
						return next(err);
					}
					console.log('User registered!')
					res.redirect('/'); //should redirect to rooms
				});
			},
			'/upload': (req,res,next) => {
			// File upload

			function generateFilename(filename){
				var ext_regex = /(?:\.([^.]+))?$/;
				var ext = ext_regex.exec(filename)[1];
				var date = new Date().getTime();
				var charBank = "abcdefghijklmnopqrstuvwxyz";
				var fstring = '';
				for(var i = 0; i < 15; i++){
					fstring += charBank[parseInt(Math.random()*26)];
				}
				return (fstring += date + '.' + ext);
			}

			var tmpFile, nfile, fname;
			var newForm = new formidable.IncomingForm();
				newForm.keepExtensions = true;
				newForm.parse(req, function(err, fields, files){
					tmpFile = files.upload.path;
					fname = generateFilename(files.upload.name);
					nfile = os.tmpDir() + '/' + fname;
					res.writeHead(200, {'Content-type':'text/plain'});
					res.end();
				})

				newForm.on('end', function(){
					fs.rename(tmpFile, nfile, function(){
						// Optionally preprocessing the file
						//gm(nfile).resize(300).write(nfile, function(){
						// Upload to the S3 Bucket
						fs.readFile(nfile, function(err, buf){
							var req = knoxClient.put(fname, {
								'Content-Length':buf.length,
								'Content-Type':'audio/wav'
							})

							req.on('response', function(res){
								if(res.statusCode == 200){
									// This means that the file is in the S3 Bucket !
									var newAudio = new singleAudioModel({
										filename:fname,
										//votes:0,

									}).save();

									Socket.emit('status', {'msg':'Saved !!', 'delay':3000});
									Socket.emit('doUpdate', {});

									// Delete the Local File
									fs.unlink(nfile, function(){
										console.log('Local File Deleted !');
									})
								}
							})
							req.end(buf);
						})
						//})
					})
				})
			},

			'/login': (req,res,next) => {
				passport.authenticate('local');
				next();
			},
			'/': (req,res,next) => {
				res.redirect('/');
			}

		},
		'NA': (req,res,next) => {
			res.status(404).sendFile(process.cwd() + '/views/404.htm');
		}
	}

	return h.route(routes);
}