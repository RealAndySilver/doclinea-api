var bcrypt = require('bcrypt');
exports.passwordEncrypt = function (req, res, next) {
	if(req.body.password){
		
		var pass = req.body.password;
		var b64 = new Buffer(req.body.password, 'base64');
		/*var hash = bcrypt.hashSync(req.body.password, 10);
		req.body.password = hash;//new Buffer(hash).toString('base64');
		*/
		var bcrypt = require('bcrypt');
		// Generate a salt
		var salt = bcrypt.genSaltSync(10);
		// Hash the password with the salt
		req.body.password = bcrypt.hashSync(req.body.password, salt);
		
		console.log("Password Original: "+pass+" Password Base 64 decoded: "+b64+" Pass hashed +b64: "+ req.body.password);
	}
	next(); 
};

exports.compareHash = function (password_in, hash) {
	return bcrypt.compareSync(password_in, hash);		
};