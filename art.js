var http = require('http'),
    fs = require('fs');
var musicbrainz = http.createClient(80, 'musicbrainz.org');
var amazon = http.createClient(80, 'ec1.images-amazon.com');
var youtube = http.createClient(80, 'img.youtube.com');

exports.youtube = function(dir, youtubeId, callback) {
	fs.stat(dir+'youtube-'+youtubeId+'.jpg', function(err, stats) {
		if (err) {
			var request = youtube.request(
				'GET',
				'/vi/'+youtubeId+'/0.jpg',
				{'host': 'img.youtube.com'}
			);
			request.end();
			request.on('response', function (response) {
				if (response.headers['content-type'] == 'image/jpeg' && response.statusCode == 200) {
					var imageParts = [];
					var imageLength = 0;
					response.on('data', function (chunk) {
						imageParts.push(chunk);
						imageLength += chunk.length;
					});
					response.on('end', function () {
						var image = new Buffer(imageLength);
						var start = 0;
						imageParts.forEach(function (imagePart) {
							imagePart.copy(image, start, 0);
							start += imagePart.length;
						});
						fs.writeFile(dir+'youtube-'+youtubeId+'.jpg', image, 'buffer', function (err) {
							if (err) {
								// Writing the file failed
								callback('Failed to save image');
							} else {
								// We got it
								callback(null, 'youtube-'+youtubeId+'.jpg');
							}
						});
					});
				} else {
					// Youtube has failed us
					callback('Not found');
				}
			});
		} else {
			// Youtube art exists, jobs a good'un
			callback(null, 'youtube-'+youtubeId+'.jpg');
		}
	});
};

exports.amazonAlbum = function(dir, artist, album, callback) {
	var request = musicbrainz.request(
		'GET',
		'/ws/1/release/?type=xml&query='+encodeURIComponent('release:'+album+' AND artist:'+artist),
		{'host': 'musicbrainz.org'}
	);
	request.end();
	request.on('response', function (response) {
		var body = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			body += chunk;
		});
		response.on('end', function () {
			var asin = body.match(/<asin>(.*?)<\/asin>/);
			if (asin && asin[1].length == 10) {
				fs.stat(dir+'amazon-'+asin[1]+'.jpg', function(err, stats) {
					if (err) {
						var request = amazon.request(
							'GET',
							'/images/P/'+asin[1]+'.jpg',
							{'host': 'ec1.images-amazon.com'}
						);
						request.end();
						request.on('response', function (response) {
							if (response.headers['content-type'] == 'image/jpeg') {
								var imageParts = [];
								var imageLength = 0;
								response.on('data', function (chunk) {
									imageParts.push(chunk);
									imageLength += chunk.length;
								});
								response.on('end', function () {
									var image = new Buffer(imageLength);
									var start = 0;
									imageParts.forEach(function (imagePart) {
										imagePart.copy(image, start, 0);
										start += imagePart.length;
									});
									fs.writeFile(dir+'amazon-'+asin[1]+'.jpg', image, 'buffer', function (err) {
										if (err) {
											// Writing the file failed
											callback('Failed to save image');
										} else {
											// We got it
											callback(null, 'amazon-'+asin[1]+'.jpg');
										}
									});
								});
							} else {
								// Amazon has failed us
								callback('Not found');
							}
						});
					} else {
						// Album art exists, jobs a good'un
						callback(null, 'amazon-'+asin[1]+'.jpg');
					}
				});
			} else {
				// Musicbrainz has failed us :(
				callback('Not found');
			}
		});
	});
}