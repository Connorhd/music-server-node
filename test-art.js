var art = require('./art');

art.amazonAlbum('./tmp/', 'Say hi', 'The wishes and the glitch', function(error, img) {
	if (error) {
		console.log(error);
	} else {
		console.log(img);
	}
});

art.amazonAlbum('./tmp/', 'Unknown artist', 'Imaginary album', function(error, img) {
	if (error) {
		console.log(error);
	} else {
		console.log(img);
	}
});


art.youtube('./tmp/', 'SMWi7CLoZ2Q', function(error, img) {
	if (error) {
		console.log(error);
	} else {
		console.log(img);
	}
});

art.youtube('./tmp/', 'notyoutube', function(error, img) {
	if (error) {
		console.log(error);
	} else {
		console.log(img);
	}
});
