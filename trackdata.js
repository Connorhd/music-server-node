#!/usr/local/bin/node
var sys = require('sys');
var fs = require('fs');

exports.getInfo = function(path, callback){

	require('child_process').exec("mplayer -ao null -vo null -frames 0 "+path, {timeout: 5000, killSignal: 'SIGKILL'}, function (error, stdout, stderr) {		
	//Mplayer the file and stop it, collect data from stdout
		
		if (error) {
		sys.puts("Error: "+error);
		}
		
		else {
			//Regex the stdout to find track data
			//The /i is necessary for case-insensitivity.
			var get = {	"track": /(Title|Song|Name): (.*)/i,			
					"artist": /(Singer|Band|Artist|Author): (.*)/i,
					"album": /(Album): (.*)/i,
					"year": /(Year|Release): (.*)/i
			};
			
			var data = {};
			
			for (var i in get) {
		
				//If data exists for the field, add it to the array.
		
				if (get[i].exec(stdout) !== null) {		
					data[i] = get[i].exec(stdout)[2];	
				}
			}

			data["output"] = stdout;

			//Run the callback function on the array.
			callback(null, data);
		}
	});
}
