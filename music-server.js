var static = require('./lib/node-static'),
	// Templating
	nun = require('./lib/nun'),
	// Persistent database
	db = require('./lib/dirty')('music-server.db'),
	// Deal with file uploads
	formidable = require('./lib/formidable'),
	sys = require('sys'),
	// Extract media info form files
	trackdata = require('./trackdata'),
	// Download album art
	art = require('./art'),
	// Signed cookie handler
	cookie = require('./lib/cookie-node');

// Static file server
var file = new(static.Server)('./static');

db.on('load', function() {
	// Load the secret cookie key, if we don't have one, make one and put it in the db.
	if (db.get('config_cookie_secret')) {
		cookie.secret = db.get('config_cookie_secret');
	} else {
		// This could probably be better
		cookie.secret = Math.floor(Math.random()*10000000000000000);
		db.set('config_cookie_secret', cookie.secret);
	}
	
	// Start the HTTP server
	require('http').createServer(function (req, res) {
		if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
			// Handle file upload
			var form = new formidable.IncomingForm();
			form.parse(req, function(err, fields, files) {
				res.writeHead(200, {'content-type': 'text/html'});
				res.write('received upload:\n\n');
				res.write(sys.inspect({fields: fields, files: files}));
				trackdata.getInfo(files.upload.path, function (data) {
					res.write(sys.inspect(data));
					if (data.artist && data.track) {
						art.amazonAlbum('./static/art/', data.artist, data.album, function(error, img) {
							if (error) {
								res.end("No art: "+error);
							} else {
								res.end('<img src="./art/'+img+'" />');
							}
						});
					} else {
						res.end("No art");
					}
				});

			});
		} else {
			// If we don't want to do anything special serve a static file
			req.addListener('end', function () {
				file.serve(req, res);
				// TODO: 404 handling
			});
		}
	}).listen(8036);
});