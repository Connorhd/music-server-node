exports.getInfo = function(path, callback){
	require('child_process').exec("mplayer -ao null -vo null -frames 0 "+path, {timeout: 5000, killSignal: 'SIGKILL'}, function (error, stdout, stderr) {
		//Mplayer the file and stop it, collect data from stdout
		
		if (error) {
			callback(error);
		} else {
			var data = {};
			data.raw = stdout;

			// Parse lines
			var lines = stdout.split("\n");
			var inInfo = false;
			data.parsed = {};
			lines.forEach(function (line) {
				if (line == "==========================================================================")
					inInfo = false;
				else if (line == "Clip info:")
					inInfo = true;
	
				if (inInfo && line.substring(0,1) == " ") {
					var split = line.indexOf(":");
					data.parsed[line.substring(1, split)] = line.substring(split + 2);
				}
			});

			// Given an array of properties return the first one which exists
			var extractTag = function (props) {
				for (var i = 0; i < props.length; i++) {
					if (data.parsed[props[i]])
						return data.parsed[props[i]];
				}
				return undefined;
			};

			data.track = extractTag(["Title", "Song", "Name"]);
			data.artist = extractTag(["Artist", "Album Artist", "Band", "Singer", "Author"]);
			data.album = extractTag(["Album"]);
			data.year = extractTag(["Year", "Release"]);

			//Run the callback function on the array.
			callback(null, data);
		}
	});
}
