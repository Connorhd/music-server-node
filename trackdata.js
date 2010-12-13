#!/usr/local/bin/node
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;

exports.getInfo = function(path, callback){

	exec("mplayer -frames 0 "+path, function (error, stdout, stderr) {		//Mplayer the file and stop it, collect data from stdout

			if (error) {
			sys.puts("Error: "+error);
			}
			
			else {
				var get = {	"track": /(Title|Song|Name): (.*)/i,			//Regex the stdout to find track data
						"artist": /(Singer|Band|Artist|Author): (.*)/i,		//The /i is necessary for case-insensitivity.
						"album": /(Disc|Album|CD): (.*)/i,
						"year": /(Year|Release): (.*)/i
				};

				var data = {};
				for (var i in get) {
					if (get[i].exec(stdout) !== null) {			//If data exists for the field
						data[i] = get[i].exec(stdout)[2];			//Add it to the array
					}
				}
			
				callback(data);							//Run the callback function on the array.
			}
	});
}
