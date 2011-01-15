var crypto = require("crypto");

exports.create = function (db, login, password) {
	// Check for existance
	if (db.get("user_"+login))
		return false;

	// Check for invalid input
	if (login.indexOf(":") !== -1)
		return false;

	var sha1 = crypto.createHash("sha1");

	var localSalt = "s"+Math.floor(Math.random()*10000000000000000);
	sha1.update(password+db.get('config_global_salt')+localSalt);
	var hash = sha1.digest("hex");
	db.set('user_'+login, {
		login: login,
		password: hash,
		salt: localSalt
	});
	return true;
}

exports.exists = function (db, login) {
	return !!(db.get("user_"+login));
}

exports.genCookie = function (db, login) {
	return login+":"+db.get("user_"+login).password;
}

exports.checkCookie = function (db, cookie) {
	var cookie = cookie.split(":");
	if (db.get("user_"+cookie[0]).password == cookie[1])
		return cookie[0];
	else
		return false;
}