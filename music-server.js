var static = require('./lib/node-static'),
	nun = require('./lib/nun'),
	db = require('./lib/dirty')('music-server.db');

var file = new(static.Server)('./static');

db.on('load', function() {
	require('http').createServer(function (request, response) {
		request.addListener('end', function () {
			file.serve(request, response);
		});
	}).listen(8036);
});