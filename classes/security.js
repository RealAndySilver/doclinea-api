var bcrypt = require('bcrypt');
exports.passwordEncrypt = function (req, res, next) {
	//Esta función toma el password recibido en Base64
	//Y lo encripta.
	//Luego de esto lo regresa al body para que continúe en la ruta
	if(req.body.password){
		req.body.password = encrypt(req.body.password);
		//En caso que se haga cambio de password, también se encripta
		//el campo new_password
		if(req.body.new_password){
			req.body.new_password = encrypt(req.body.new_password);
		}
	}
	next(); 
};
exports.decodeBase64 = function(data){
	//Función que decodifica base64
	return new Buffer(data, 'base64').toString();
};
exports.base64 = function(data){
	//Función que codifica base64
	return new Buffer(data).toString('base64');
};
var encrypt = function(data){
	var bcrypt = require('bcrypt');
	// Genera un salt
	var salt = bcrypt.genSaltSync(10);
	// Se hace hash del password con el salt
	var result = bcrypt.hashSync(data, salt);
	return result;
};
exports.encrypt = function(data){
	//Exporta la función de encriptar
	return encrypt(data);
};
exports.compareHash = function (password_in, hash) {
	//Compara y exporta el resultado de el hash del password
	//y el hash generado
	return bcrypt.compareSync(password_in, hash);		
};