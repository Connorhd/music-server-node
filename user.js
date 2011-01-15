var crypto = require("crypto");

exports.create = function (login, password, globalSalt) {
	var sha1 = crypto.createHash("sha1");

	var localSalt = "s"+Math.floor(Math.random()*10000000000000000);
	sha1.update(password+globalSalt+localSalt)
}
