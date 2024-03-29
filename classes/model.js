//////////////////////////////////
//Dependencies////////////////////
//////////////////////////////////
var mongoose = require('mongoose');
var apn = require('apn');
var send_push = require('../classes/push_sender');
var utils = require('../classes/utils');
var mail = require('../classes/mail_sender');
var mail_template = require('../classes/mail_templates');
var fs = require('fs');
var express = require('express');
var knox = require('knox');
var gcm = require('node-gcm');
var	security = require('../classes/security');
var colors = require('colors');
//////////////////////////////////
//End of Dependencies/////////////
//////////////////////////////////

//////////////////////////////////
//MongoDB Connection /////////////
//////////////////////////////////
mongoose.connect("mongodb://iAmUser:iAmStudio1@ds061199.mongolab.com:61199/doclinea");
//////////////////////////////////
//End of MongoDB Connection///////
//////////////////////////////////

//////////////////////////////////
//Global Vars/////////////////////
//////////////////////////////////
var exclude = {/*password:0*/};
var verifyEmailVar = false;

//Producción
//var hostname = "192.241.187.135:1414";
//var webapp = "192.241.187.135:3000"
//Dev
var hostname = "192.168.0.41:1414";
var webapp = "localhost:3000"

//////////////////////////////////
//End of Global Vars//////////////
//////////////////////////////////

//////////////////////////////////
//SubDocumentSchema///////////////
//////////////////////////////////
var TypeSchema = new mongoose.Schema({name:String, category:String});
var ReasonSchema = new mongoose.Schema({reason:String});
var Device = new mongoose.Schema({type:String, os:String, token:String, name:String}, {_id:false});
var Education = new mongoose.Schema({institute_name:String, degree:String, year_start:String, year_end:String, hilights:String}, {_id:false});
var Settings = new mongoose.Schema({email_appointment_notifications:Boolean, email_marketing_notifications:Boolean, mobile_appointment_notifications:Boolean, mobile_marketing_notifications:Boolean}, {_id:false});
//////////////////////////////////
//End SubDocumentSchema///////////
//////////////////////////////////

//////////////////////////////////
//CMS Schema/////////////////
//////////////////////////////////
var CMSSchema= new mongoose.Schema({
	type : {type : String, required: true, unique: true},
	home_info : {type: Object},
	notification_info : {type: Object}
}),
	CMS= mongoose.model('CMS',CMSSchema);
//////////////////////////////////
//End HomePage Schema ////////////
//////////////////////////////////

//////////////////////////////////
//Admin Schema////////////////////
//////////////////////////////////
var AdminSchema= new mongoose.Schema({
	name: {type: String, required: true,unique: false,},
	email: {type: String, required: true,unique: true,},
	password: {type: String, required: true,unique: false,},
	type: {type: String, required: true,unique: false,},
	role:{type: String, required: true,unique: false,},
}),
	Admin= mongoose.model('Admin',AdminSchema);
//////////////////////////////////
//End of Admin Schema/////////////
//////////////////////////////////

//////////////////////////////////
//User Schema/////////////////////
//////////////////////////////////
var UserSchema= new mongoose.Schema({
	email : {type: String, required:true, unique:true,},
	password : {type: String, required:true},
	password_recover : {status: {type: Boolean}, token:{type:String}},
	birthday : {type: Date, required: false},
	email_confirmation : {type: Boolean, required:true},
	name : {type: String, required:true},
	lastname : {type: String, required:false},
	gender : {type: String, required:false},
	phone : {type: String, required:false},
	country : {type: String, required:false},
	city : {type: String, required:false},
	localidad : {type: Object, required:false},
	address : {type: String, required:false},
	status : {type: Number, required:false},
	insurance : {type: String, required:false},
	verified : {type: Boolean, required:false},
	date_created : {type: Date, required:true},
	log : {type: Object, required:false},
	active_appointments : {type: Array, required:false},
	completed_appointments : {type: Array, required:false},
	canceled_appointments : {type: Array, required:false},
	devices : {type: [Device], required:false},
	settings: {email_appointment_notifications:Boolean, email_marketing_notifications:Boolean, mobile_appointment_notifications:Boolean, mobile_marketing_notifications:Boolean},
	favorites : {type: Array, required:false},
}),
	User= mongoose.model('User',UserSchema);
//////////////////////////////////
//End of User Schema//////////////
//////////////////////////////////

//////////////////////////////////
//Doctor Schema///////////////////
//////////////////////////////////
var DoctorSchema= new mongoose.Schema({
	name : {type: String, required:true},
	password : {type: String, required:true},
	birthday : {type: Date, required:false},
	password_recover : {status: {type: Boolean}, token:{type:String}},
	lastname : {type: String, required:true},
	email : {type: String, required:true, unique:true,},
	secondary_email : {type: String, required:false,},
	gender : {type: String, required:true},
	patient_gender : {type: Number, required:true}, //1 male, 2 female, 3 both
	email_confirmation : {type: Boolean, required:true},
	status : {type: String, required:true},
	payment_list : {type: Array, required:false},
	last_payment : {type: Object, required:false},
	trial_expired : {type: Object, required:false},
	subscription_type : {type: Number, required:false}, //2 monthly, 3 yearly, 1 trial
	date_created : {type: Date, required:true},
	expiration_date : {type: Date, required:false},
	phone : {type: String, required:false},
	address : {type: String, required:false},
	city : {type: String, required:false},
	localidad : {type: Object, required:false},
	country : {type: String, required:false, unique:false,},
	location_list : {type: Array, required:false},
	location : {type: {type: String}, 'coordinates':{type:[Number]}},
	hospital_list : {type: Array, required:false},
	insurance_list : {type: Array, required:false},
	education_list : {type: [Education], required:false},
	profesional_membership : {type: Array, required:false},
	practice_list : {type: Array, required:false},
	profile_pic : {type: Object, required:false},
	gallery : {type: Array, required:false},
	overall_rating : {type: Number, required:false},
	review_list : {type: Array, required:false},
	description : {type: String, required:false},
	language_list : {type: Array, required:false},
	settings: {email_appointment_notifications:Boolean, email_marketing_notifications:Boolean, mobile_appointment_notifications:Boolean, mobile_marketing_notifications:Boolean},
});
	DoctorSchema.index({location:"2dsphere", required:false})
	Doctor= mongoose.model('Doctor',DoctorSchema);
//////////////////////////////////
//End of Doctor Schema////////////
//////////////////////////////////

//////////////////////////////////
//Appointment Schema//////////////
//////////////////////////////////
var AppointmentSchema= new mongoose.Schema({
	user_id : {type: String, required:false},
	user_name: {type: String, required:false},
	insurance: {type: Array, required: false},
	patient_phone: {type: String, required:false},
	patient_name: {type: String, required:false},
	patient_is_user: {type: Boolean, required:false},
	//user_notes: {type: String, required:false},
	doctor_id : {type: String, required:true},
	doctor_name: {type: String, required:false},
	doctor_image: {type: String, required:false},
	doctor_notes: {type: String, required:false},
	date_created : {type: Date, required:true},
	appointment_length : {type: Number, required:false},
	type : {type: String, required:false},
	status : {type: String, required:false}, //available, cancelled, taken, external
	reason : {type: String, required:false},
	date_start : {type: Date, required:true},
	date_end : {type: Date, required:true},
	location : {type: Object, required:false},
}),
	Appointment= mongoose.model('Appointment',AppointmentSchema);
//////////////////////////////////
//End of Appointment  Schema//////
//////////////////////////////////

//////////////////////////////////
//Schedule Schema/////////////////
//////////////////////////////////
var ScheduleSchema= new mongoose.Schema({
	doctor_id : {type: String, required:true},
	date_created : {type: Date, required:true},
	appointment_length : {type: Number, required:true},
	active_appointments : {type: Array, required:false},
	monday : {type: Array, required:false},
	tuesday : {type: Array, required:false},
	wednesday : {type: Array, required:false},
	thursday : {type: Array, required:false},
	friday : {type: Array, required:false},
	saturday : {type: Array, required:false},
	sunday : {type: Array, required:false},
}),
	Schedule= mongoose.model('Schedule',ScheduleSchema);
//////////////////////////////////
//End of Schedule Schema//////////
//////////////////////////////////

//////////////////////////////////
//Hospital Schema/////////////////
//////////////////////////////////
var HospitalSchema= new mongoose.Schema({
	email : {type: String, required:true, unique:true,},
	name : {type: String, required:false},
	location_list : {type: Array, required:false},
	location : {type: {type: String}, 'coordinates':{type:[Number]}},
	city : {type: String, required:false},
	logo : {type: Object, required:false},
}),
	Hospital= mongoose.model('Hospital',HospitalSchema);
//////////////////////////////////
//End of Hospital Schema//////////
//////////////////////////////////

//////////////////////////////////
//Practice Schema/////////////////
//////////////////////////////////
var PracticeSchema= new mongoose.Schema({
	name : {type: String, required:false, unique: true},
	type : {type: String, required:false},
	reason_list : {type: [ReasonSchema], required:false},
}),
	Practice= mongoose.model('Practice',PracticeSchema);
//////////////////////////////////
//End of Practice Schema//////////
//////////////////////////////////

//////////////////////////////////
//Insurance Schema////////////////
//////////////////////////////////
var InsuranceCompanySchema= new mongoose.Schema({
	name : {type: String, required:true, unique: true},
	email : {type: String, required:true, unique: true},
	logo : {type: Object, required:false},
	type_list: {type: [TypeSchema]},
}),
	InsuranceCompany= mongoose.model('InsuranceCompany',InsuranceCompanySchema);
//////////////////////////////////
//End of Insurance Schema/////////
//////////////////////////////////

//////////////////////////////////
//Insurance Type Schema///////////
//////////////////////////////////
var InsuranceTypeSchema= new mongoose.Schema({
	company_id : {type: String, required:false},
	name : {type: String, required:true},
}),
	InsuranceType= mongoose.model('InsuranceType',InsuranceTypeSchema);
//////////////////////////////////
//End of Insurance Type Schema////
//////////////////////////////////

//////////////////////////////////
//Review Schema///////////////////
//////////////////////////////////
var ReviewSchema= new mongoose.Schema({
	user_id : {type: String, required:true},
	doctor_id : {type: String, required:true},
	general : {type: Number, required:true},
	waiting_time : {type: Number, required:true},
	good_treat : {type: Number, required:true},
	review : {type: String, required:true},
	date_created : {type: Date, required:true},
}),
	Review= mongoose.model('Review',ReviewSchema);
//////////////////////////////////
//End of Review Schema////////////
//////////////////////////////////

//////////////////////////////////
//Image Schema////////////////////
//////////////////////////////////
var ImageSchema= new mongoose.Schema({
	name:{type: String, required: false,unique: false,},
	owner: {type: String, required: false,unique: false,}, //user, doctor, insurance
	owner_id: {type: String, required: false,unique: false,},
	type:{type: String, required: false,unique: false,}, //profile, gallery, logo
	size:{type: Number, required:false, unique:false,},
	url:{type: String, required: false,unique: false,},
}),
	Image= mongoose.model('Image',ImageSchema);
//////////////////////////////////
//End of Image Schema/////////////
//////////////////////////////////

//Development AMAZON BUCKET
var client = knox.createClient({
    key: 'AKIAJ32JCWGUBJ3BWFVA'
  , secret: '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'
  , bucket: 'doclinea'
});

//////////////////////////////////
//CMS  texts//////////////////////
//////////////////////////////////
//Home Update and Create
exports.updateCMSHomePage = function(req,res){
	var filtered_body = utils.remove_empty(req.body);
	CMS.findOne({type:"Home"}, function(err, home){
		if(!home){
			filtered_body.type = "Home";
			new CMS(filtered_body).save(function(err,object){
				if(err){
					res.json(err);
				}
				else{
					res.json({status: true, response: object, message: "Home creado exitosamente"});
				}
			});
		}
		else{
			CMS.findOneAndUpdate({type:"Home"},
			   {$set:filtered_body}, 
			   	function(err,home){
			   		/*Log*/utils.log("Home/Update","Envío:",JSON.stringify(home));
				   	res.json({status:true, message:"Home actualizado exitosamente", response:home});
			});
		}
	});
};
//Notifications Update and Create
exports.updateCMSNotifications = function(req,res){
	var filtered_body = utils.remove_empty(req.body);
	CMS.findOne({type:"Notifications"}, function(err, notif){
		if(!notif){
			filtered_body.type = "Notifications";
			new CMS(filtered_body).save(function(err,object){
				if(err){
					res.json(err);
				}
				else{
					res.json({status: true, response: object, message: "Notificaciones creadas exitosamente"});
				}
			});
		}
		else{
			CMS.findOneAndUpdate({type:"Home"},
			   {$set:filtered_body}, 
			   	function(err,notif){
			   		/*Log*/utils.log("Notifications/Update","Envío:",JSON.stringify(notif));
				   	res.json({status:true, message:"Home actualizado exitosamente", response:notif});
			});
		}
	});
};
//Get Home
exports.getHome = function(req,res){
	CMS.findOne({type:"Home"},function(err,home){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: home});
		}
	});
};
//Get Notifications
exports.getNotifications = function(req,res){
	CMS.findOne({type:"Notifications"},function(err,notif){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: notif});
		}
	});
};
//////////////////////////////////
//Endo of Home page texts/////////
//////////////////////////////////

//////////////////////////////////
//Admin CRUD starts here//////////
//////////////////////////////////
//Create
exports.createAdmin = function(req,res){
	new Admin({
		name:req.body.name,
		email:req.body.email,
		password:req.body.password,
		type: 'admin',
		role: 'admin'
	}).save(function(err,admin){
		if(err){
			res.json(err);
		}
		else{
			res.json({status: true, response: admin});
		}
	});
};
//Read One
exports.getAdmin = function(req,res){
	Admin.findOne({_id:req.params._id},function(err,admin){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: admin});
		}
	});
};
//Read All
exports.getAdminList = function(req,res){
	Admin.find({},function(err,admins){
		if(admins.length<=0){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status:true, response:admins});
		}
	});
};
//Update
exports.updateAdmin = function(req,res){
	Admin.findOneAndUpdate({_id:req.body.admin_id},
	   {$set:{name:req.body.name,
	   		  email:req.body.email,
	   		  password:req.body.password,
	   		  //app_id_list:req.body.app_id_list,
	   		  }
	   	}, 
	   	function(err,admin){
	   	if(!admin){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	res.json({status:true, response:admin});
	   	}
		
	});
};
//Delete
exports.deleteAdmin = function(req,res){
	Admin.remove({_id:req.params.admin_id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.format({
				html: function () { res.redirect('/Dashboard/'+req.params.super_admin_id); },
				json: function () { res.send(admin); },
			});
		}
	});
};
//////////////////////////////////
//End of Admin CRUD///////////////
//////////////////////////////////

//////////////////////////////////
//User CRUD starts here//////////
//////////////////////////////////
//Create*
exports.createUser = function(req,res){
	//Esta función crea un usuario nuevo a partir de una peticion POST
	var device_array = [];
	
	//Revisamos la información que llega y la parseamos en un formato json conocido
	if(req.body.device_info){
		req.body.device_info = utils.isJson(req.body.device_info) ? JSON.parse(req.body.device_info): req.body.device_info ;
		device_array.push(req.body.device_info);
	}
	//Procedemos a crear el usuario en la base de datos con la información que llega en el POST
	utils.log("User/Create","Recibo:",JSON.stringify(req.body));
	new User({
		email : req.body.email,
		birthday: req.body.birthday,
		//El estado inicial de confirmación email debe ser false
		//Este se trabaja con una variable global al principio de este documento
		email_confirmation : verifyEmailVar,
		//////////////////////////////////////
		//////////////////////////////////////
		password : req.body.password,
		name : req.body.name,
		lastname : req.body.lastname,
		gender : req.body.gender,
		phone : req.body.phone,
		country : req.body.country,
		city : req.body.city,
		address : req.body.address,
		insurance : req.body.insurance,
		verified : false,
		date_created: new Date(),
		devices: device_array,
	}).save(function(err,user){
		if(err){
			res.json(err);
		}
		else{
			//Una vez creado el documento en la base de datos procedemos a enviar un email
			//de confirmación
			emailVerification(req,user,'user');
			utils.log("User/Create","Envío:",JSON.stringify(user));
			res.json({status: true, message: "Usuario creado exitosamente. Proceder a activar la cuenta.", response: user});
		}
	});
};
//Read One*
exports.getUserByEmail = function(req,res){
	//Esta función expone un servicio para buscar un usuario por email
	User.findOne({email:req.params.email},exclude,function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: user});
		}
	});
};
exports.getUserByID = function(req,res){
	//Esta función expone un servicio para buscar un usuario por id
	User.findOne({_id:req.params.id},exclude,function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: user});
		}
	});
};
//Login*
exports.authenticateUser = function(req,res){
//Esta función permite verificar la autenticidad del usuario por medio de un mail y un password
//Además de esto, si el usuario está en la versión móvil, nos permite capturar información 
//importante sobre su dispositivo

/*Log*/utils.log("User/Authenticate","Recibo:",JSON.stringify(req.body));

	//Buscamos inicialmente que la cuenta del usuario exista
	User.findOne({email:req.body.email},exclude,function(err,user){
		if(!user){
			//No existe
			res.json({status: false, error: "not found", error_id:0});
		}
		else{
			//Verificamos que el hash guardado en password sea igual al password de entrada
			if(security.compareHash(req.body.password, user.password)){
				//Acá se verifica si llega device info, y se agrega al device list del usuario
				//En este punto ya se encuentra autenticado el usuario, las respuestas siempre serán positivas
				if(req.body.device_info){
					//En caso que recibamos información sobre el dispositivo
					//procedemos a parsear esta información en un formato json conocido
					/*Log*/utils.log("User/Authenticate","Envío:",JSON.stringify(user));
					req.body.device_info = utils.isJson(req.body.device_info) ? JSON.parse(req.body.device_info): req.body.device_info ;
					
					//Procedemos a guardar esta información dentro del documento
					User.findOneAndUpdate({email:req.body.email}, {$addToSet:{devices:req.body.device_info}}, function(err,new_user){
						//Si no hay ningún error al guardar el device_info
						if(!err){
							if(!new_user){
								//Verificamos que el usuario ya haya verificado su cuenta
								//por medio del email que enviamos
								if(user.email_confirmation){
									/*Log*/utils.log("User/Authenticate","Envío:",JSON.stringify(user));
									res.json({status: true, response: user, message:"Autenticado correctamente, pero no se pudo agregar el dispositivo"});
								}
								//Si no está verificado negamos el login
								else{
									utils.log("User/Authenticate","Envío:","Email no confirmado");
									res.json({status: false, error: "User not confirmed. Please confirm by email", error_id:1});
								}						
							}
							else{
								//Verificamos que el usuario ya haya verificado su cuenta
								//por medio del email que enviamos
								if(user.email_confirmation){
									/*Log*/utils.log("User/Authenticate","Envío:",JSON.stringify(user));
									res.json({status: true, response: new_user});
								}
								//Si no está verificado negamos el login
								else{
									utils.log("User/Authenticate","Envío:","Email no confirmado");
									res.json({status: false, error: "User not confirmed. Please confirm by email", error_id:1});
								}
							}
						}
						//Hubo error al guardar el device_info
						//Por lo tanto, esta información no quedará en el documento
						else{
							//Verificamos que el usuario ya haya verificado su cuenta
							//por medio del email que enviamos
							if(user.email_confirmation){
								/*Log*/utils.log("User/Authenticate","Envío:",JSON.stringify(user));
								res.json({status: true, response: user, message:"Autenticado correctamente, pero ocurrió un error.", error:err});
							}
							//Si no está verificado negamos el login
							else{
								/*Log*/utils.log("User/Authenticate","Envío:","Email no confirmado");
								res.json({status: false, error: "User not confirmed. Please confirm by email", error_id:1});
							}
						}
					});
				}
				//No hay device info, así que esta sección pertenece a la app web
				else{
					//Verificamos que el usuario ya haya verificado su cuenta
					//por medio del email que enviamos
					if(user.email_confirmation){
						res.json({status: true, response: user});
					}
					//Si no está verificado negamos el login
					else{
						/*Log*/utils.log("User/Authenticate","Envío:","Email no confirmado");
						res.json({status: false, error: "User not confirmed. Please confirm by email", error_id:1});
					}
				}
			}
			//No se encontró el user
			else{
				res.json({status: false, error: "not found"});
			}
		}
	});
};
//Read All*
exports.getAllUsers = function(req,res){
	//Esta función expone un servicio para buscar todos los usuarios sin ningún criterio de búsqueda
	User.find({},exclude,function(err,users){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: users});
		}
	});
};
//Update*
exports.updateUser = function(req,res){
	//Esta función actualiza la información del usuario por medio de un POST
	/*Log*/utils.log("User/Update","Recibo sin filtro:",JSON.stringify(req.body));
	
	//Cómo medida de seguridad
	//Eliminamos los parámetros _id, password y email que 
	//vienen del POST para evitar que se sobreescriban
	req.body._id = '';
	req.body.email = '';
	req.body.password = '';
	
	//Parseamos los settings que llegan en un formato JSON conocido
	if(req.body.settings){
		req.body.settings = utils.isJson(req.body.settings) ? JSON.parse(req.body.settings): req.body.settings ;
	}
	
	//Filtramos el body del POST para remover parámetros vacíos
	//ya que la actualización se realiza de manera dinámica
	var filtered_body = utils.remove_empty(req.body);
	
	/*Log*/utils.log("User/Update","Recibo:",JSON.stringify(filtered_body));
	
	//Buscamos el usuario que se desea actualizar por medio de su _id
	User.findOneAndUpdate({_id:req.params.user_id},
		//Seteamos el nuevo contenido
	   {$set:filtered_body}, 
	   	function(err,user){
	   	if(!user){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
	   		/*Log*/utils.log("User/Create","Envío:",JSON.stringify(user));
		   	res.json({status:true, message:"Usuario actualizado exitosamente.", response:user});
	   	}
	});
};
//Password*
exports.requestRecoverUser = function(req,res){
	/*utils.log("User/Recover","Recibo:",req.params.user_email);*/
	//Este servicio permite al usuario comenzar el proceso de recuperación de contraseña
	//Se necesita únicamente el email
	User.findOne({email:req.params.user_email},function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			//Encriptamos el mail del usuario
			var token = security.encrypt(user.email);
			//Encodeamos el resultado en base64
			var tokenB64 = security.base64(token);
			//seteamos password_recover como true, así se entiende que el proceso
			//de recuperación ya inició
			user.password_recover = {status:true, token:token};
			//guardamos
			user.save(function(err, result){
				if(err){
					res.json({status: false, error: err});
				}
				else{
					if(result){
						var url = 'http://'+hostname+'/api_1.0/Password/Redirect/user/'+user.email+'/new_password/'+tokenB64;
						//Enviamos el mail al usuario para que recupere su contraseña
						mail.send("Recuperar Contraseña", 
									"Hola "+user.name+". <br>Ingresa a este link para recuperar tu contraseña:<br> <a href='"+url+"'> Doclinea </a>", 
									user.email);
						res.json({status: true, response: {token:tokenB64}});
					}
				}
			});
		}
	});
};
exports.newPasswordUser = function(req,res){
	//Este servicio permite cambiar la contraseña una vez el proceso de cambio
	//ha sido solicitado
	
	//Tomamos el token que llega en la url y lo decodificamos base 64
	var token_decoded = security.decodeBase64(req.params.token);
	/*Log*/utils.log("User/NewPassword","Recibo:",token_decoded);
	
	//Buscamos el token en la base de datos y verificamos que el proceso de cmabio
	//de contraseña haya sido iniciado
	User.findOne({password_recover:{status:true, token: token_decoded}},function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			//seteamos password_recover cómo falso
			user.password_recover.status = false;
			//removemos el token
			user.password_recover.token = "";
			//seteamos el nuevo password
			user.password = req.body.password;
			//guardamos
			user.save(function(err, result){
				if(err){
					
				}
				else{
					if(result){
						//Enviamos correo notificando que la clave ha sido cambiada con éxito
						mail.send("Clave Cambiada Con Exito!", "Hola "+user.name+". <br>Tu contraseña ha sido cambiada con éxito. Ingresa ya a Doclinea:<br> <a href='http://doclinea.com'> Doclinea </a>", user.email);
						res.json({status: true, response: result});
					}
				}
			});
		}
	});
};
exports.changePasswordUser = function(req,res){
	//Este servicio le permite al usuario cambiar la clave desde su dashboard
	/*Log*/utils.log("User/ChangePassword","Recibo:",JSON.stringify(req.body));
	User.findOne({_id:req.params.user_id},function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			//Verificamos que el hash guardado en password sea igual al password de entrada
			if(security.compareHash(req.body.password, user.password)){
				//Acá se verifica si llega device info, y se agrega al device list del usuario
				//En este punto ya se encuentra autenticado el usuario, las respuestas siempre serán positivas
				user.password = security.encrypt(req.body.new_password);
				user.save(function(err, result){
					if(err){
						/*Log*/utils.log("User/ChangePassword","Error:",JSON.stringify(err));
						res.json({status: false, error: err, message: "Ocurrió un error al actualizar la contraseña."});
					}
					else{
						/*Log*/utils.log("User/ChangePassword","Envío:",JSON.stringify(user));
						res.json({status: true, response: user, message: "Contraseña actualizada exitosamente."});
					}
				});			
			}
			else{
				res.json({status: false, error: "La contraseña es incorrecta."});
			}
		}
	});
};
//Delete
exports.deleteUser = function(req,res){
	//Este servicio permite borrar un usuario ingresando el email
	User.remove({email:req.body.email},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Usuario borrado exitosamente."});
		}
	});
};
//Invite*
exports.userInvite = function(req,res){
	//Este servicio permite a un usuario existente invitar a 
	//cualquier persona a utilizar doclinea
	/*Log*/utils.log("User/Invite","Recibo:",JSON.stringify(req.body));
	User.findOne({email:req.body.email}, function(err,user){
		if(user){
			//Enviamos el correo
			console.log("1");
			mail.send(user.name+ " " + user.lastname + " quiere que pruebes DocLinea!", req.body.message,req.body.destination_email);
			res.json({status:true, message:"Mensaje enviado con éxito."});
		}
		else{
			Doctor.findOne({email:req.body.email}, function(err,doctor){
				if(doctor){
					//Enviamos el correo
					console.log("1");
					mail.send(doctor.name+ " " + doctor.lastname + " quiere que pruebes DocLinea!", req.body.message,req.body.destination_email);
					res.json({status:true, message:"Mensaje enviado con éxito."});
				}
				else{
					console.log("2");
					res.json({status:false, message:"Error al enviar al mensaje. No hay autenticación."});
				}
			});
		}
	});
}
//Fav Doctor*
exports.favDoctor = function(req,res){
	//Este servicio le permite a un usuario agregar a cualquier doctor a su listado de favoritos
	/*Log*/utils.log("User/Fav","Recibo:",JSON.stringify(req.body));
	User.findOneAndUpdate({_id:req.params.user_id},{$addToSet:{favorites:req.body.doctor_id}}, function (err,user) {
		if(user){
			Doctor.find({_id:{$in:user.favorites}}, function(err,doctors){
				if(doctors.length>0){
					res.json({
								response: doctors, 
								message: "Doctor agregado a favoritos de manera exitosa.", 
								status:true
							});
				}
				else{
					res.json({message:"No hay favoritos para este usuario", status:true, response:doctors});
				}
				
			});
		}
		else{
			res.json({status:false, message:"Error al agregar doctor como favorito."});
		}
	});
};
//UnFav Doctor*
exports.unFavDoctor = function(req,res){
	//Este servicio le permite a un usuario remover a cualquier doctor de su listado de favoritos
	User.findOneAndUpdate({_id:req.params.user_id},{$pull:{favorites:req.body.doctor_id}}, function (err,user) {
		if(!user){
			res.json({message:"No se encontró el usuario.", status:false});
		}
		else{
			Doctor.find({_id:{$in:user.favorites}}, function(err,doctors){
				if(doctors.length>0){
					res.json({
								response: doctors, 
								message: "Doctor removido de favoritos de manera exitosa.", 
								status:true
							});
				}
				else{
					res.json({message:"No hay favoritos para este usuario", status:true, response:doctors});
				}
			});
		}
	});
};
//Get Favorites*
exports.getFavorites = function(req,res){
	//Este servicio le permite a un usuario ver su listado de favoritos
	/*Log*/utils.log("User/GetFavorites","Recibo:",JSON.stringify(req.body));
	User.findOne({_id:req.params.user_id}, function(err,user){
		if(!user){
			res.json({message:"No se encontró el usuario.", status:false});
		}
		else{
			Doctor.find({_id:{$in:user.favorites}}, function(err,doctors){
				if(doctors.length>0){
					res.json({response: doctors, status:true});
				}
				else{
					res.json({message:"No hay favoritos para este usuario", status:true, response:doctors});
				}
			});
		}	
	});
};
//////////////////////////////////////
//End of User CRUD////////////////////
//////////////////////////////////////

//////////////////////////////////////
//Doctor CRUD starts here/////////////
//////////////////////////////////////
//Create*
exports.createDoctor = function(req,res){
	//Esta función crea un doctor nuevo a partir de una peticion POST
	/*Log*/utils.log("Doctor/Create","Recibo:",JSON.stringify(req.body));
	
	var location_list = [];
	var location = {};
	var coordinates = [];
	//Revisamos la información de geolocalización qué llega y formamos el objeto especial
	//que requiere mongo para la búsqueda por proximidad
	if(req.body.lat && req.body.lon){
		coordinates.push(req.body.lon);
		coordinates.push(req.body.lat);
		location_list.push({location_address:req.body.location_address, location_name:req.body.location_name, lat:req.body.lat, lon:req.body.lon});
		location = {loc:{type:'Point', coordinates: coordinates}};
	}
	//Si no recibimos nada ponemos 0 en las coordenadas
	else{
		coordinates.push(0);
		coordinates.push(0);
		location = {loc:{type:'Point', coordinates: coordinates}};
	}
	//Revisamos la información que llega y la parseamos en un formato json conocido
	if(req.body.localidad){
		req.body.localidad = utils.isJson(req.body.localidad) ? JSON.parse(req.body.localidad): req.body.localidad ;
	}
	var practice_list = [];
	practice_list.push(req.body.practice_list);
	new Doctor({
		name : req.body.name,
		birthday: req.body.birthday,
		status : false,
		password : req.body.password,
		lastname : req.body.lastname,
		email : req.body.email,
		email_confirmation : verifyEmailVar,
		gender : req.body.gender, //1 m, 2 f
		patient_gender : req.body.patient_gender, //1 masculino, 2 femenino, 3 ambos
		date_created : new Date(),
		phone : req.body.phone,
		address : req.body.address,
		city : req.body.city,
		localidad: req.body.localidad,
		country : req.body.country,
		practice_list : practice_list,
		location_list : location_list,
		location: location.loc
	}).save(function(err,doctor){
		if(err){
			res.json(err);
		}
		else{
			//Enviamos mail de verificación al doctor
			emailVerification(req,doctor,'doctor');
			/*Log*/utils.log("Doctor/Create","Envío:",JSON.stringify(doctor));
			res.json({status: true, message: "Doctor creado exitosamente. Proceder a activar la cuenta.", response: doctor});
		}
	});
};
//Add Pic*
exports.addPicToGallery = function(req,res){
	//Este servicio permite guardar una nueva imagen en la galería de imágenes del doctor
	/*Log*/utils.log("User/AddPicToGallery","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({_id:req.params.doctor_id},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			/*Log*/utils.log("User/AddPicToGallery","Envio:",JSON.stringify(doctor));
			uploadImage(req.files.image,doctor,"gallery", 'doctor');
			res.json({status: true, response: 'update in progress, get doctor again to see results'})
		}
	});
};
//Read One*
exports.getDoctorByEmail = function(req,res){
	//Se obtiene un doctor a partir de un email
	Doctor.findOne({email:req.params.email},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: doctor});
		}
	});
};
exports.getDoctorByID = function(req,res){
	//Se obtiene un doctor a partir de un _id
	/*Log*/utils.log("User/GetByID","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({_id:req.params.id},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			/*Log*/utils.log("User/GetByID","Envío:",JSON.stringify(doctor));
			res.json({status: true, response: doctor});
		}
	});
};
//Read All*
exports.getAllDoctors = function(req,res){
	//Obtiene todos los doctores sin ningún filtro o criterio de búsqueda
	Doctor.find({},exclude,function(err,doctors){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: doctors});
		}
	});
};
exports.getDoctorsByParams = function(req,res){
	//Este servicio busca doctor con cualquier criterio o dato entregado por medio del body del POST
	//Se pueden mezclar múltiples criterios para hacer la búsqueda más precisa
	
	///////////////////////////////////////////////////////////////////////////
	//Estas comprobaciones se encargan de revisar los datos y parsearlos en json si es necesario 
	//(iOS envía texto y hay que parsearlo)
	///////////////////////////////////////////////////////////////////////////
	if(req.body.localidad){
		req.body.localidad = utils.isJson(req.body.localidad) ? JSON.parse(req.body.localidad): req.body.localidad ;
	}
	if(req.body.insurance_list){
		/////////////////
		//En este caso utilizamos $elemMatch y $and para que busque un objeto específico en un arreglo
		/////////////////
		req.body.insurance_list = {$elemMatch: {$and: utils.isJson(req.body.insurance_list) ? JSON.parse(req.body.insurance_list): req.body.insurance_list }};
	}
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	var filtered_body = utils.remove_empty(req.body);
	
	var query = {};
	query = req.body;
	
	//Esta línea filtra a los doctores que hayan sido validados por email previamente
	//Se le puede agregar que el status del doctor sea activo en un futuro cuando se implementen los pagos.
	///NO OLVIDAR DESCOMENTAR!!
	//query.email_confirmation = true;
	
	//Búsqueda por proximidad
	var meters = parseInt(req.body.meters);
	delete req.body.meters;
	if(req.body.lat && req.body.lon){
		query.location = {$near :{$geometry :{type : "Point" ,coordinates :[req.body.lon, req.body.lat]},$maxDistance : meters}};	
	}
	
	//Búsqueda por nombre y apellido
	if(query.name){
		query.name = utils.regexForString(query.name);
	}
	if(query.lastname){
		query.lastname = utils.regexForString(query.lastname);
	}
	delete query.lat;
	delete query.lon;
	/*Log*/utils.log("User/GetByParams","Recibo:",JSON.stringify(query));
	Doctor.find(query,
		exclude,
		function(err,doctors){
		if(!err){
			if(doctors.length<=0){
				res.json({status: false, error: "not found"});
			}
			else{
				/*Log*/utils.log("User/GetByParams","Envío:",JSON.stringify(doctors));
				res.json({status: true, response: doctors});
			}
		}
		else{
			res.json({status: false, error: err});
		}
	});
};
//Update*
exports.updateDoctor = function(req,res){
	//Este servicio permite actualizar todos los datos del doctor
	
	//Borramos por seguridad _id, password y email para evitar 
	//que estos datos se sobreescriban
	req.body._id='';
	req.body.email = '';
	req.body.password = '';
	
	var location_list = [];
	var location = {};
	var coordinates = [];
	
	///////////////////////////////////////////////////////////////////////////
	//Estas comprobaciones se encargan de revisar los datos y parsearlos en json si es necesario 
	//(iOS envía texto y hay que parsearlo)
	///////////////////////////////////////////////////////////////////////////
	if(req.body.settings){
		req.body.settings = utils.isJson(req.body.settings) ? JSON.parse(req.body.settings): req.body.settings ;
	}
	if(req.body.localidad){
		req.body.localidad = utils.isJson(req.body.localidad) ? JSON.parse(req.body.localidad): req.body.localidad ;
	}
	if(req.body.education_list){
		req.body.education_list = utils.isJson(req.body.education_list) ? JSON.parse(req.body.education_list): req.body.education_list ;
	}
	if(req.body.location_list){
		req.body.location_list = utils.isJson(req.body.location_list) ? JSON.parse(req.body.location_list): req.body.location_list ;
	}
	if(req.body.practice_list){
		req.body.practice_list = utils.isJson(req.body.practice_list) ? JSON.parse(req.body.practice_list): req.body.practice_list ;
	}
	if(req.body.profesional_membership){
		req.body.profesional_membership = utils.isJson(req.body.profesional_membership) ? JSON.parse(req.body.profesional_membership): req.body.profesional_membership ;
	}
	if(req.body.insurance_list){
		req.body.insurance_list = utils.isJson(req.body.insurance_list) ? JSON.parse(req.body.insurance_list): req.body.insurance_list ;
	}
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	
	///////////////////////////////////////////////////////////////////////////
	//Acá comprobamos que llegue tanto lat como lon
	//Una vez comprobado ingresamos las coordenadas en un arreglo
	//y ordenamos la información para ponerla en el objeto especial de location
	//También ingresamos estos datos a location_list , 
	//parámetro que funciona cómo lectura para los dispositivos y web
	///////////////////////////////////////////////////////////////////////////
	if(req.body.location_list){
		if(req.body.location_list.lat && req.body.location_list.lon){
			coordinates.push(req.body.location_list.lon);
			coordinates.push(req.body.location_list.lat);
			location_list.push({location_address:req.body.location_address, location_name:req.body.location_name, lat:req.body.lat, lon:req.body.lon, parking: req.body.parking});
			req.body.location = {type:'Point', coordinates: coordinates};
		}
		req.body.location_list = utils.isJson(req.body.location_list) ? JSON.parse(req.body.location_list): req.body.location_list ;
	}
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	///////////////////////////////////////////////////////////////////////////
	//En este punto vamos a limpiar el body con cualquier parámetro que llegue vacío
	///////////////////////////////////////////////////////////////////////////
	var filtered_body = utils.remove_empty(req.body);
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	
	///////////////////////////////////////////////////////////////////////////
	//Estos if se encargan de recibir un 0 dentro del arreglo, indicando que debe borrar todo su contenido
	//Esto debe hacerse después del filtrado del body
	///////////////////////////////////////////////////////////////////////////
	if (req.body.education_list){
		if(req.body.education_list[0] == 0){
			req.body.education_list = [];
		}
	}
	if (req.body.practice_list){
		if(req.body.practice_list[0] == 0){
			req.body.practice_list = [];
		}
	}
	if (req.body.insurance_list){
		if(req.body.insurance_list[0] == 0){
			req.body.insurance_list = [];
		}
	}
	if (req.body.profesional_membership){
		if(req.body.profesional_membership[0] == 0){
			req.body.profesional_membership = [];
		}
	}
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	
	/*Log*/utils.log("Doctor/Update","Recibo:",JSON.stringify(filtered_body));
	
	Doctor.findOneAndUpdate({_id:req.params.doctor_id},
	   {$set:filtered_body},
	   	function(err,doctor){
	   	if(!doctor){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
	   		/*Log*/utils.log("Doctor/Update","Envío:",JSON.stringify(doctor));
		   	res.json({status:true, message:"Doctor actualizado exitosamente.", response:doctor});
	   	}
	});
};
exports.updateProfilePic = function(req,res){
	//Este servicio permite poner una foto de perfil para el doctor
	/*Log*/utils.log("Doctor/UpdateProfilePic","Recibo:",JSON.stringify(req.files));
	Doctor.findOne({_id:req.params.doctor_id},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			/*Log*/utils.log("Doctor/UpdateProfilePic","Envío:",JSON.stringify(doctor));
			uploadImage(req.files.image,doctor,"profile", 'doctor');
			res.json({status: true, response: 'update in progress, get doctor again to see results'})
		}
	});
};

exports.authenticateDoctor = function(req,res){
	//Este servicio autentica al doctor
	/*Log*/utils.log("Doctor/Authenticate","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({email:req.body.email},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found", error_id:0});//0 doctor not found
		}
		else{
			//Verificamos que el hash guardado en password sea igual al password de entrada
			if(security.compareHash(req.body.password, doctor.password)){
				if(doctor.email_confirmation){
					/*Log*/utils.log("Doctor/Authenticate","Envío:",JSON.stringify(doctor));
					doctor.password_recover.status = false;
					doctor.password_recover.token = "";
					doctor.save(function(err, result){
						res.json({status: true, response: doctor});
					});
				}
				else{
					/*Log*/utils.log("Doctor/Authenticate","Envío:","Email no confirmado");
					res.json({status: false, error: "Doctor not confirmed. Please confirm by email", error_id:1});//1 doctor not confirmed 
				}
				
			}
			else{
				res.json({status: false, error: "not found", error_id:0});//0 doctor not found
			}
		}
	});
};
//Password*
exports.requestRecoverDoctor = function(req,res){
	//Este servicio permite al doctor comenzar el proceso de recuperación de contraseña
	//Se necesita únicamente el email
	//El proceso es el mismo que el de recuperar contraseña en el usuario
	/*Log*/utils.log("Doctor/Recover","Recibo:",req.params.doctor_email);
	Doctor.findOne({email:req.params.doctor_email},function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			var token = security.encrypt(doctor.email);
			var tokenB64 = security.base64(token);
			doctor.password_recover = {status:true, token:token};
			doctor.save(function(err, result){
				if(err){
					res.json({status: false, error: err});
				}
				else{
					if(result){
						var url = 'http://'+hostname+'/api_1.0/Password/Redirect/doctor/'+doctor.email+'/new_password/'+tokenB64;
						mail.send("Recuperar Contraseña", 
									"Hola "+doctor.name+". <br>Ingresa a este link para recuperar tu contraseña:<br> <a href='"+url+"'> Doclinea </a>", 
									doctor.email);
						res.json({status: true, response: {token:tokenB64}});
					}
				}
			});
		}
	});
};
exports.newPasswordDoctor = function(req,res){
	//Este servicio permite cambiar la contraseña una vez el proceso de cambio
	//ha sido solicitado
	//El proceso es el mismo que el de crear nueva contraseña en el usuario
	
	var token_decoded = security.decodeBase64(req.params.token);
	/*Log*/utils.log("Doctor/NewPassword","Recibo:",token_decoded);
	Doctor.findOne({password_recover:{status:true, token: token_decoded}},function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			doctor.password_recover.status = false;
			doctor.password_recover.token = "";
			doctor.password = req.body.password;
			doctor.save(function(err, result){
				if(err){
					
				}
				else{
					if(result){
						mail.send("Clave Cambiada Con Exito!", "Hola "+doctor.name+". <br>Tu contraseña ha sido cambiada con éxito. Ingresa ya a Doclinea:<br> <a href='http://doclinea.com'> Doclinea </a>", doctor.email);
						res.json({status: true, response: result});
					}
				}
			});
		}
	});
};
exports.changePasswordDoctor = function(req,res){
	//Este servicio le permite al usuario cambiar la clave desde su dashboard
	//El proceso es el mismo que el de cambiar contraseña en el usuario

	/*Log*/utils.log("Doctor/ChangePassword","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({_id:req.params.doctor_id},function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			//Verificamos que el hash guardado en password sea igual al password de entrada
			if(security.compareHash(req.body.password, doctor.password)){
				//Acá se verifica si llega device info, y se agrega al device list del usuario
				//En este punto ya se encuentra autenticado el usuario, las respuestas siempre serán positivas
				doctor.password = security.encrypt(req.body.new_password);
				doctor.save(function(err, result){
					if(err){
						/*Log*/utils.log("Doctor/ChangePassword","Error:",JSON.stringify(err));
						res.json({status: false, error: err, message: "Ocurrió un error al actualizar la contraseña."});
					}
					else{
						/*Log*/utils.log("User/ChangePassword","Envío:",JSON.stringify(doctor));
						res.json({status: true, response: doctor, message: "Contraseña actualizada exitosamente."});
					}
				});			
			}
			else{
				res.json({status: false, error: "La contraseña es incorrecta."});
			}
		}
	});
};
//Delete
exports.removeGalleryPic = function(req,res){
	//Este servicio permite remover una imagen específica 
	//de la galería de imágenes del doctor
	/*Log*/utils.log("Doctor/RemoveGalleryPic","Recibo:",JSON.stringify(req.body));
	Doctor.findOneAndUpdate(
	    {_id: req.params.doctor_id},
	    {$pull: {gallery: {name:req.body.name}}},
	    {multi: true},
	    function(err, doctor) {
	    	if(!doctor){
		    	res.json({status:false, message: 'Error al borrar'});
	    	}
	    	else{
				/*Log*/utils.log("Doctor/RemoveGalleryPic","Envío:",JSON.stringify(doctor));
	        	res.json({status:true, message: 'Borrado' ,response:doctor});
	    	}
	    }
	);
};
exports.deleteDoctor = function(req,res){
	//Este servicio elimina un doctor a partir de un id de doctor 
	//entregado en el body del POST
	Doctor.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Usuario borrado exitosamente."});
		}
	});
};
//////////////////////////////////////
//End of Doctor CRUD//////////////////
//////////////////////////////////////

//////////////////////////////////////
//Hospital CRUD starts here///////////
//////////////////////////////////////
//Create*
exports.createHospital = function(req,res){
	//Este servicio crea un nuevo hospital a partir de una petición POST
	var location = {};
	var coordinates = [];
	
	//Revisamos la información de geolocalización qué llega y formamos el objeto especial
	//que requiere mongo para la búsqueda por proximidad
	if(req.body.lat && req.body.lon){
		coordinates.push(req.body.lon);
		coordinates.push(req.body.lat);
		location = {type:'Point', coordinates: coordinates};
	}
	else{
		coordinates.push(0);
		coordinates.push(0);
		location = {type:'Point', coordinates: coordinates};
	}
	new Hospital({
		name : req.body.name,
		location : location,
		address : req.body.address,
		email: req.body.email,
	}).save(function(err,hospital){
		if(err){
			res.json(err);
		}
		else{
			res.json({status: true, message: "Hospital creado exitosamente."});
		}
	});
};
//Read One*
exports.getHospitalByID = function(req,res){
	//Obtiene un hospital a partir de un _id de hospital
	Hospital.findOne({_id:req.params.hospital_id},function(err,hospital){
		if(!hospital){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: hospital});
		}
	});
};
//Read All*
exports.getAllHospitals = function(req,res){
	//Obtiene todos los hospitales de la base de datos 
	//sin ningún criterio de búsqueda
	Hospital.find({},function(err,hospitals){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: hospitals});
		}
	});
};
//Update*
exports.updateHospital = function(req,res){
	//Actualiza la información de un hospital a partir de 
	//un _id de hospital entregado en la url
	req.body._id='';
	req.body.email = '';
	var location_list = [];
	var location = {};
	var coordinates = [];
	if(req.body.location_list){
		if(req.body.location_list.lat && req.body.location_list.lon){
			coordinates.push(req.body.location_list.lon);
			coordinates.push(req.body.location_list.lat);
			location_list.push({location_address:req.body.location_address, location_name:req.body.location_name, lat:req.body.lat, lon:req.body.lon});
			req.body.location = {type:'Point', coordinates: coordinates};
		}
		req.body.location_list = utils.isJson(req.body.location_list) ? JSON.parse(req.body.location_list): req.body.location_list ;
	}
	var filtered_body = utils.remove_empty(req.body);
	/*Log*/utils.log("Hospital/Update","Recibo:",JSON.stringify(req.body));
	Hospital.findOneAndUpdate({_id:req.params.hospital_id},
	   {$set:filtered_body}, 
	   	function(err,hospital){
	   	if(!hospital){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	/*Log*/utils.log("Hospital/Update","Envío:",JSON.stringify(hospital));
		   	res.json({status:true, message:"Hospital actualizado exitosamente."});
	   	}
	});
};
exports.updateHospitalPic = function(req,res){
	//Actualiza la imagen principal del hospital
	/*Log*/utils.log("Hospital/UpdatePic","Recibo:",JSON.stringify(req.files));
	Hospital.findOne({_id:req.params.hospital_id},exclude,function(err,hospital){
		if(!hospital){
			res.json({status: false, error: "not found"});
		}
		else{
			/*Log*/utils.log("Hospital/UpdatePic","Envío:",JSON.stringify(hospital));
			uploadImage(req.files.image,hospital,"profile", 'hospital');
			res.json({status: true, response: 'update in progress, get hostpital again to see results'})
		}
	});
};
//Delete*
exports.deleteHospital = function(req,res){
	//Elimina un hospital a partir de un id de hospital
	//entregado en el body del POST
	Hospital.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Hospital borrado exitosamente."});
		}
	});
};
//////////////////////////////////////
//End of Hospital CRUD////////////////
//////////////////////////////////////

//////////////////////////////////////
//InsuranceCompany CRUD starts here///
//////////////////////////////////////
//Create*
exports.createInsuranceCompany = function(req,res){
	//Este servicio crea una nueva compañía de seguros
	/*Log*/utils.log("InsuranceCompany/Create","Recibo:",JSON.stringify(req.body));
	new InsuranceCompany({
		name : req.body.name,
		email : req.body.email,
	}).save(function(err,insurancecompany){
		if(err){
			res.json({status: false, error: "Error. no se pudo crear la compañía de seguros", error:err});
		}
		else{
			res.json({status: true, message: "Compañía de seguros creada exitosamente.", response:insurancecompany});
		}
	});
};
exports.addInsurancetype = function(req,res){
	//Este servicio agrega un tipo de seguro a una compañía
	//creada previamente, requiere un id de insurancecompany en la url
	//para poder crearlo exitosamente
	if(req.body.name && req.body.category){
		InsuranceCompany.findOneAndUpdate(
		    {_id: req.params.insuranceCompanyID},
		    {$addToSet: {type_list: {name:req.body.name, category:req.body.category}}},
		    {safe: true, upsert: true},
		    function(err, insuranceCompany) {
		    	if(err){
			    	res.json({status: false, error: "Error. no se pudo agregar el tipo de seguro a la compañía"});
		    	}
		    	else{
			    	res.json({status: true, message: "Tipo de seguro agregado exitosamente", response:insuranceCompany});
		    	}
		    }
		);
	}
	else{
		res.json({status: false, error: "Error. no se pudo agregar el tipo de seguro a la compañía"});
	}	
};
//Read One*
exports.getInsuranceCompanyByID = function(req,res){
	//Este servicio obtiene un insurancecompany a partir de un id en la url
	InsuranceCompany.findOne({_id:req.params.insurancecompany_id},function(err,insurancecompany){
		if(!insurancecompany){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: insurancecompany});
		}
	});
};
//Read All*
exports.getAllInsuranceCompanies = function(req,res){
	//Este servicio obtiene todos los insurancecompanies sin
	//ningún criterio de búsqueda ni filtro
	InsuranceCompany.find({},function(err,insurancecompany){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: insurancecompany});
		}
	});
};
//Update*
exports.updateInsuranceCompany = function(req,res){
	//Este servicio actualiza un insurance company
	var filtered_body = utils.remove_empty(req.body);
	InsuranceCompany.findOneAndUpdate({_id:req.params.insurancecompany_id},
	   {$set:filtered_body}, 
	   	function(err,insurancecompany){
	   	if(!insurancecompany){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	res.json({status:true, message:"Compañía de seguros actualizada exitosamente."});
	   	}
	});
};
exports.updateInsuranceCompanyPic = function(req,res){
	//Este servicio actualiza la imagen del insurance company
	//Se recibe el id del insurancecompany en la url para ser modificado
	/*Log*/utils.log("InsuranceCompany/UpdatePic","Recibo:",JSON.stringify(req.files));
	InsuranceCompany.findOne({_id:req.params.insurancecompany_id},exclude,function(err,insurancecompany){
		if(!insurancecompany){
			res.json({status: false, error: "not found"});
		}
		else{
			/*Log*/utils.log("InsuranceCompany/UpdatePic","Envío:",JSON.stringify(insurancecompany));
			uploadImage(req.files.image,insurancecompany,"profile", 'insurancecompany');
			res.json({status: true, response: 'update in progress, get insurancecompany again to see results'})
		}
	});
};
//Delete*
exports.removeInsuranceType = function(req,res){
	//Este servicio borra algún tipo de seguro existenete en un insurncecompany
	InsuranceCompany.findOneAndUpdate(
	    {_id: req.params.id},
	    {$pull: {type_list: {_id:req.body.id}}},
	    {multi: true},
	    function(err, insuranceCompany) {
	        if(err){
		    	res.json({status: false, error: "Error. no se pudo remover el tipo de seguro a la compañía"});
	    	}
	    	else{
		    	res.json({status: true, message: "Tipo de seguro removido exitosamente", response:insuranceCompany});
	    	}
	    }
	);
};
exports.deleteInsuranceCompany = function(req,res){
	//Este servicio borra por completo un insurancecompany
	//Se recibe id de insurancecompany en el body de la petición POST
	InsuranceCompany.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Compañía de seguros borrada exitosamente."});
		}
	});
};
//////////////////////////////////////
//End of InsuranceCompany CRUD////////
//////////////////////////////////////

//////////////////////////////////////
//Practice CRUD starts here///////////
//////////////////////////////////////
//Create*
exports.createPractice = function(req,res){
	//Este servicio crea una nueva especialidad
	new Practice({
		name : req.body.name,
		type : req.body.type,
	}).save(function(err,practice){
		if(err){
			res.json({status: false, error: "Error. no se pudo crear la especialidad de seguros"});
		}
		else{
			res.json({status: true, message: "Especialidad creada exitosamente.", response:practice});
		}
	});
};
exports.addAppointmentReason = function(req,res){
	//Este servicio crea una razón de consulta para una especialidad
	if(req.body.reason){
		Practice.findOneAndUpdate(
		    {_id: req.params.practice_id},
		    {$addToSet: {reason_list: {reason:req.body.reason}}},
		    {safe: true, upsert: true},
		    function(err, practice) {
		    	if(err){
			    	res.json({status: false, error: "Error. no se pudo agregar este motivo de consulta."});
		    	}
		    	else{
			    	res.json({status: true, message: "Motivo de consulta agregado exitosamente", response:practice});
		    	}
		    }
		);
	}
	else{
		res.json({status: false, error: "Error. no se pudo agregar un motivo de consulta"});
	}	
};
//Read One*
exports.getPracticeByID = function(req,res){
	//Este servicio obtiene una especialidad a partir de un _id de especialidad
	Practice.findOne({_id:req.params.practice_id},function(err,practice){
		if(!practice){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: practice});
		}
	});
};
//Read All*
exports.getAllPractices = function(req,res){
	//Este servicio obtiene todas las especialidades sin ningún tipo de criterio o filtro
	Practice.find({},function(err,practices){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: practices});
		}
	});
};
//Update*
exports.updatePractice = function(req,res){
	//Este servicio actualiza una especialidad a partir del _id de especialidad
	var filtered_body = utils.remove_empty(req.body);
	Practice.findOneAndUpdate({_id:req.params.practice_id},
	   {$set:filtered_body}, 
	   	function(err,practice){
	   	if(!practice){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	res.json({status:true, message:"Especialidad actualizada exitosamente."});
	   	}
	});
};
//Delete*
exports.removeAppointmentReason = function(req,res){
	//Este servicio remueve una razón de consulta de una especialidad
	Practice.findOneAndUpdate(
	    {_id: req.params.practice_id},
	    {$pull: {reason_list: {_id:req.body.reason_id}}},
	    {multi: true},
	    function(err, practice) {
	        if(err){
		    	res.json({status: false, error: "Error. no se pudo remover el motivo de consulta para esta especialidad."});
	    	}
	    	else{
		    	res.json({status: true, message: "Motivo de consulta removido exitosamente", response:practice});
	    	}
	    }
	);
};
exports.deletePractice = function(req,res){
	//Este servicio elimina completamente una especialidad
	Practice.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Especialidad de seguros borrada exitosamente."});
		}
	});
};
//////////////////////////////////
//End of Practice CRUD////////////
//////////////////////////////////

//////////////////////////////////
//Appointment CRUD starts here////
//////////////////////////////////
//Create*
exports.createAppointment = function(req,res){
	//Este servicio crea una nueva cita
	//El único con capacidad de crear citas es el doctor
	//Por lo tanto es obligatorio el _id y el nombre del doctor 
	//para crear una cita
	var filtered_body = utils.remove_empty(req.body);
	new Appointment({
		doctor_id : req.params.doctor_id,
		doctor_name: req.body.doctor_name,
		doctor_image : req.body.doctor_image,
		doctor_notes: req.body.doctor_notes,
		date_created : new Date(),
		appointment_length : 10,
		type : req.body.type,
		status : req.body.status, //available, external
		date_start : req.body.date_start,
		date_end : req.body.date_end,
		location : req.body.location,
	}).save(function(err,appointment){
		if(err){
			res.json({status: false, error:err, message: "La cita no pudo ser creada"});
		}
		else{
			res.json({status: true, message: "Cita "+req.body.status+ " creada exitosamente."});
		}
	});
};
//Read One*
exports.getAppointmentByID = function(req,res){
	//Este servicio obtiene una cita a partir de un _id de appointment
	Appointment.findOne({_id:req.params.appoinment_id},function(err,appointment){
		if(!appointment){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: appointment});
		}
	});
};
//Read Many*
exports.getAppointmentsAvailableForDoctor = function(req,res){
	//Este servicio obtiene todas las citas disponibles para un doctor	

	//Este filtro de fecha nos permite enviar únicamente citas a partir de hoy
	//Las citas pasadas no se mostrarán.
	var dateNow = Date.now(-1);
	////////////////////////
	Appointment.find({doctor_id:req.params.doctor_id, status:"available",date_start:{$gt:dateNow}},function(err,appointment){
		if(!appointment){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: appointment});
		}
	});
};
exports.getTakenAppointmentsByUser = function(req,res){
	//Este servicio obtiene todas las citas tomadas por un usuario
	Appointment.find({user_id:req.params.user_id, $or:[{status: "available"},{status:"confirmed"}]},function(err,appointment){
		if(!appointment){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: appointment});
		}
	});
};
//Read All*
exports.getAllAppointments = function(req,res){
	//Este servicio obtiene todas las citas sin ningún criterio o filtro
	Appointment.find({},function(err,appointments){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: appointments});
		}
	});
};
exports.getAllAppointmentsForDoctor = function(req,res){
	//Este servicio obtiene todas las citas asignadas a un doctor
	//Cuenta con un filtro de fecha y por lo tanto no mostrará 
	//ninguna cita con fecha anterior a hoy	
	//Se entregan ordenados por fecha
	var dateNow = Date.now(-1);
	Appointment.find({doctor_id:req.params.doctor_id, date_start:{$gt:dateNow}})
	.sort("date_start")
	.execFind(function(err,appointments){
		if(!appointments){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: appointments});
		}
	});
};
exports.getAllAppointmentsForUser = function(req,res){
	//Este servicio obtiene todas las citas tomadas por un usuario
		
	//Este filtro de fecha nos permite enviar únicamente citas a partir de hoy
	//Las citas pasadas no se mostrarán.
	//Se entregan ordenados por fecha
	var dateNow = Date.now(-1);
	////////////////////////
	Appointment.find({user_id:req.params.user_id, status:"taken", date_start:{$gt:dateNow}})
	.sort("date_start")
	.execFind(function(err,appointment){
		if(!appointment){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: appointment});
		}
	});
};
//Update*
exports.takeAppointment = function(req,res){
	//Revisamos la información que llega y la parseamos en un formato json conocido
	if(req.body.insurance){
		req.body.insurance = utils.isJson(req.body.insurance) ? JSON.parse(req.body.insurance): req.body.insurance ;
	}
	//Este servicio permite a un usuario tomar una cita con estado available
	var filtered_body = utils.remove_empty(req.body);
	/*Log*/utils.log("Appointment/Take","Recibo:",JSON.stringify(req.body));
	Appointment.findOneAndUpdate({_id:req.params.appointment_id, status: "available"},
	   {$set:filtered_body}, 
	   	function(err,appointment){
	   	if(!appointment){
		   	res.json({status: false, error: "Cita no disponible."});
	   	}
	   	else{
		   	/*Log*/utils.log("Appointment/Take","Envío:",JSON.stringify(appointment));
		   	res.json({status:true, message:"Cita actualizada exitosamente."});
	   	}
	});
};
exports.updateAppointment = function(req,res){
	//Este servicio permite actualizar los datos de una cita
	var filtered_body = utils.remove_empty(req.body);
	/*Log*/utils.log("Appointment/Update","Recibo:",JSON.stringify(req.body));
	Appointment.findOneAndUpdate({_id:req.params.appointment_id},
	   {$set:filtered_body}, 
	   	function(err,appointment){
	   	if(!appointment){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	/*Log*/utils.log("Appointment/Update","Envío:",JSON.stringify(appointment));
		   	res.json({status:true, message:"Cita actualizado exitosamente."});
	   	}
	});
};
exports.cancelAppointment = function(req,res){
	//Este servicio permite cmbiar el status de una cita
	//ó borrarla permanentemente
	
	var filtered_body = utils.remove_empty(req.body);
	/*Log*/utils.log("Appointment/Cancel","Recibo:",JSON.stringify(req.body));
	//Filtramos la entrada al servicio por medio del type, recibimos un user o un doctor
	if(req.params.type == "user"){
		//Si es un usuario quién la cancela, la cita se deja de nuevo en estado disponible
		//Para que otro usuario pueda tomarla
		//Para esto, borramos todos los datos del usuario y dejamos el status= available
		Appointment.findOneAndUpdate({_id:req.params.appointment_id, user_id:req.body.user_id, status: "taken"},
		   {$set:{user_id : "",
			user_name: "",
			patient_phone: "",
			patient_name: "",
			insurance: {},
			patient_is_user: false,
			status : "available", //available, cancelled, taken, external
			reason : ""
			}
			}, 
		   	function(err,appointment){
		   	if(!appointment){
			   	res.json({status: false, error: "Cita no disponible para cancelar."});
		   	}
		   	else{
			   	/*Log*/utils.log("Appointment/Cancel","Envío:",JSON.stringify(appointment));
			   	///////////////////////////
			   	//Enviar correo electrónico de cancelación y push notifications si es necesario acá
			   	//////////////////////////
			   	res.json({status:true, message:"Cita cancelada exitosamente."});
		   	}
		});
	}
	else if(req.params.type == "doctor"){
		//Si es el doctor quién la cancela, dejamos el status = cancelled
		//Es posible, si es necesario, en vez de cancelar el status simplemente
		//borrar el objeto, pero es probable que se requiera hacer métrica
		//de cuantos servicios han sido cancelados y por lo tanto se deja de esta manera
		Appointment.findOneAndUpdate({_id:req.params.appointment_id, doctor_id:req.body.doctor_id},
		   {$set:{status : "cancelled"}}, 
		   	function(err,appointment){
		   	if(!appointment){
			   	res.json({status: false, error: "Cita no disponible para cancelar."});
		   	}
		   	else{
			   	/*Log*/utils.log("Appointment/Cancel","Envío:",JSON.stringify(appointment));
			   	///////////////////////////
			   	//Enviar correo electrónico de cancelación y push notifications si es necesario acá
			   	//////////////////////////
			   	res.json({status:true, message:"Cita cancelada exitosamente."});
		   	}
		});
	}
};
//Delete*
exports.removeAppointment = function(req,res){
	//Este servicio elimina completamente una cita a partir de
	//un id recibido en el body del POST
	Appointment.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Hospital borrado exitosamente."});
		}
	});
};
//////////////////////////////////
//End of Appointment CRUD/////////
//////////////////////////////////

//////////////////////////////////
//Verify//////////////////////////
//////////////////////////////////
//Verify*
exports.verifyAccount= function(req,res){
	//Este servicio se encarga de recibir la verificación de email
	//y validar al usuario/doctor en el sistema para que pueda loguearse
	/*Log*/utils.log("Account/Verify/"+req.params.type,"Recibo:",req.params.emailb64);
	
	//Desencodeamos base64 del email recibido en los parámetros de la URl
	var email_decoded = security.decodeBase64(req.params.emailb64);
	
	//Verificamos si es un doctor o un usuario
	if(req.params.type == "doctor"){
		Doctor.findOne({email:email_decoded},function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			//Confirmamos que no se haya confirmado con anterioridad
			//para evitar envío masivo de correos de verificación
			//lo guardamos en una variable para utilizarlo más adelante
			var checkIfConfirmed = doctor.email_confirmation;
			doctor.email_confirmation = true;
			doctor.save(function(err, result){
				if(err){
					res.json({status: false, error: err});
				}
				else{
					if(result){
						//Guardamos la url del landing page en una variable
						var url = 'http://'+webapp;
						//Utilizamos la variable de confirmación
						//y enviamos el correo únicamente si no ha sido previamente confirmado
						if(!checkIfConfirmed){
							mail.send("!Bienvenido a DocLinea!", mail_template.doctor_new_account(doctor,url), doctor.email);
						}
						
						var data = {};
						data.email = email_decoded;
						data.type = 'doctor';
						//Redirigimos finalmente a la aplicación web/móbil
						//dependiendo de donde haya sido abrierto el link
						browserAccountRedirect(req,res,data);
					}
				}
			});
		}
	});
	}
	else if(req.params.type == "user"){
		User.findOne({email:email_decoded},function(err,user){
			if(!user){
				res.json({status: false, error: "not found"});
			}
			else{
				//Confirmamos que no se haya confirmado con anterioridad
				//para evitar envío masivo de correos de verificación
				//lo guardamos en una variable para utilizarlo más adelante
				var checkIfConfirmed = user.email_confirmation;
				user.email_confirmation = true;
				user.save(function(err, result){
					if(err){
						res.json({status: false, error: err});
					}
					else{
						if(result){
							//Guardamos la url del landing page en una variable
							var url = 'http://'+webapp;
							//Utilizamos la variable de confirmación
							//y enviamos el correo únicamente si no ha sido previamente confirmado
							if(!checkIfConfirmed){
								mail.send("!Bienvenido a DocLinea!", mail_template.user_new_account(user,url), user.email);
							}
							var data = {};
							data.email = email_decoded;
							data.type = 'user';
							//Redirigimos finalmente a la aplicación web/móbil
							//dependiendo de donde haya sido abrierto el link
							browserAccountRedirect(req,res,data);
						}
					}
				});
			}
		});
	}
};
exports.sendEmailVerification = function(req,res){
	//Este servicio se encarga de enviar el correo de verificación
	/*Log*/utils.log("Account/SendEmailVerification","Recibo:",JSON.stringify(req.body));
	var email_decoded = security.decodeBase64(req.params.emailb64);
	if(email_decoded == req.body.email){
		if(req.params.type == 'doctor'){
			Doctor.findOne({email:email_decoded}, function(err,doctor){
				if(!doctor){
					res.json({status: false, error: 'not found'});
				}
				else{
					emailVerification(req,doctor,'doctor');
					res.json({status: true, response: 'Email sent to: '+doctor.email});
				}
			});
		}
		else if(req.params.type == 'user'){
			User.findOne({email:email_decoded}, function(err,user){
				if(!user){
					res.json({status: false, error: 'not found'});
				}
				else{
					emailVerification(req,user,'user');
					res.json({status: true, response: 'Email sent to: '+user.email});
				}
			});
		}
	}
	else{
		res.json({status: false, error: 'Wrong data.'});
	}
};
//////////////////////////////////
//End of Verify///////////////////
//////////////////////////////////

//////////////////////////////////
//Send Push Notification*/////////
//////////////////////////////////
exports.sendPush = function (req,res){
	//Este servicio se encarga de enviar mensajes push a los dispositivos iOS
	//y Android. Debido a qué las aplicaciones no están al aire, este método 
	//no ha sido plenamente implementado
	
	var android = req.body.android ? true:false;
	var ios = req.body.ios ? true:false;
	Admin.findOne({_id:req.body.admin_id}, function(err,admin){
		if(!admin){
			
		}
		else{
			new Push({
			message: req.body.message,
			app_id:req.body.app_id,
			date:new Date(),
			sent_by:admin,
			android:android,
			ios:ios,
			delivered_qty_ios: ios ? req.body.delivered_qty_ios:0,
			delivered_qty_android: android ? req.body.delivered_qty_android:0,
			}).save(function(err,push){
				if(err){
					res.json({response:"error creating push on DB", error:err});
				}
				else{
				if(ios){
					PushToken.find({app_id:req.body.app_id, device_brand:"Apple"},{ push_token: 1, _id: 0 }, function(err,pushtokens){
						if(pushtokens.length<=0){
						}
						else{
							App.findOne({_id:req.body.app_id}, function(err,app){
								var extension = ".pem";
								var carpeta = app.is_development ? "push_certs/dev/":"push_certs/prod/";
								var url = app.is_development ? 'gateway.sandbox.push.apple.com':'gateway.push.apple.com';
								var cert = carpeta+app.ios_cert+extension;
								var key =  carpeta+app.ios_cert_key+extension;
								var tokens_array = new Array();
								for(var i=0;i<pushtokens.length;i++){
									tokens_array.push(pushtokens[i].push_token);
								}
								var service = new apn.connection({ gateway:url, cert:cert, key:key});

								service.on('connected', function() {console.log("Connected");});
								service.on('transmitted', function(notification, device) {
									console.log("Notification transmitted to:" + device.token.toString('hex'));
								});
								service.on('transmissionError', function(errCode, notification, device) {
								    console.error("Notification caused error: " + errCode + " for device ", device, notification);
								});
								service.on('timeout', function () {console.log("Connection Timeout");});
								service.on('disconnected', function() {console.log("Disconnected from APNS");});
								service.on('socketError', console.error);								
								
								pushToManyIOS = function(tokens) {
								    var note = new apn.notification();
								    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
									note.badge = 0;
									note.sound = "ping.aiff";
									note.alert = req.body.message;
									note.payload = {'action': "no action"};
								    service.pushNotification(note, tokens);
								}
								pushToManyIOS(tokens_array);
							});
						}
					});
				}
				if(android){
					PushToken.find({app_id:req.body.app_id, device_brand:"Android"}, function(err,pushtokens){
						if(pushtokens.length<=0){
						}
						else{
							App.findOne({_id:req.body.app_id}, function(err,app){
							if(app){
									var message = new gcm.Message({
									    collapseKey: 'demo',
									    delayWhileIdle: true,
									    timeToLive: 3,
									    data: {
									        key1: 'message1',
									        key2: 'message2'
									    }
									});
									
									var sender = new gcm.Sender(app.gcm_apikey);
									var registrationIds = [];
									message.addDataWithObject({
									    message: req.body.message,
									    app_name: app.name,
									});
									
									message.collapseKey = 'demo';
									message.delayWhileIdle = true;
									message.timeToLive = 3;
									
									for(var i=0;i<pushtokens.length;i++){
										registrationIds.push(pushtokens[i].push_token);		
									}					
									
									sender.send(message, registrationIds, 4, function (err, result) {
									    console.log(result);
									});
								}
							});
						}
					});
				}
					res.format({
						html: function () { res.redirect('/Dashboard/'+req.body.admin_id); },
						json: function () { res.send(); },
					});
				}
			});
		}
	});
};
//////////////////////////////////
//End of Send Push Notification///
//////////////////////////////////

/////////////////////////////////
//Functions//////////////////////
/////////////////////////////////
//Image Uploader*//
var uploadImage = function(file,object,type,owner){
	var amazonUrl = '';
	var findSpace = ' ';
	var regSpace = new RegExp(findSpace, 'g');
	var findSpecial = '[\\+*?\\[\\^\\]$(){}=!<>|:]';
	var regSpecial = new RegExp(findSpecial, 'g');
	
	//Verificamos que llegue archivo adjunto
	if(!file){
		object.profile_pic = {name:"", image_url: ""};
		object.save(function(err,obj){
		});
		console.log('No hay archivo');
		return;
	} 
	
	//Guardamos el path de la imagen en una variable
	//Y verificamos su extensión para proceder con el guardado adecuado
	var tmp_path_image_url = file.path;
    var extension =".jpg";
    if(file.type=="image/png"){
    	extension=".png";
    }
    
    //Generamos una ruta de guardado temporal local
	var target_path_image_url = './public/images/' + file.size + file.name;  
	
	//Revisamos que el tamaño del adjunto sea mayor a 0  
    if(file.size>0){
		fs.renameSync(tmp_path_image_url,target_path_image_url);		
		fs.stat(target_path_image_url, function(err, stat){
		  
			if(err){
				console.log("error1 "+err);
			}
			else{
				//Si no hay error en el proceso de guardado local
				//Procedemos a subir el archivo al bucket con una ruta definida coherentemente
				//Esta ruta se genera con los parámetros de entrada de la función
								
				amazonUrl = owner+'/'+
							object.email+'/'+
							type+"/"+
							file.name;
				
				amazonUrl = amazonUrl.
								replace(regSpace, '').
								replace(regSpecial, '');
								
				var req = client.put(amazonUrl, {
					      'Content-Length': stat.size,
					      'Content-Type': file.type,
					      'x-amz-acl': 'public-read'
				});
				fs.createReadStream(target_path_image_url).pipe(req);
				
				//Cuando el servidor responda, procedemos a guardar la información
				//De la imagen en la base de datos
				req.on('response', function(res){
					fs.unlink(target_path_image_url, function(){});
					new Image({
						name:file.name,
						url:req.url,
						owner: owner,
						owner_id: object._id,
						type: type,
						size:file.size,
					}).save(function(err,image){	
						if(err){
						}
						else{
							
							//Procedemos a actualizar el objeto doctor, hospital, o seguro
							//Al cual se le haya agregado la imagen
							//El doctor tiene 2 tipos de imágenes. Perfil, y galería.
							if(owner=="doctor"){
								if(type=="profile"){
									object.profile_pic = {name:image.name, image_url: image.url, id: image._id};
									object.save(function(err,doctor){
											return {status: true, response: {image_url:image.url}};
									});
								}
								else if(type=="gallery"){
									Doctor.findOneAndUpdate(
									    {_id: object._id},
									    {$push: {gallery: {image_url:image.url, name:file.name, id: image._id}}},
									    {safe: true, upsert: true},
									    function(err, doctor) {
									        console.log("Doctor: "+doctor);
									    }
									);
								}
							}
							
							//Los hospitales y seguros sólo tienen foto de perfil
							else if(owner == "hospital" || owner == "insurancecompany"){
								if(type=="profile"){
									object.logo = {name:image.name, image_url: image.url, id: image._id};
									object.save(function(err,doctor){
											return {status: true, response: {image_url:image.url}};
									});
								}
							}						
						}
					});
			  });
			}
		});
	}
    else{
	    //Si el tamaño del adjunto no es mayor a 0 quiere decir que no hay adjunto
	    console.log('no hay imagen');
    }
}
//Browser Account Redirect*//
var browserAccountRedirect = function (req,res,data){
//Esta sección detecta en que browser y sistema operativo se abre
//El correo de verificación de la cuenta.
//Esto con el fin de redireccionar a la app en caso de móvil
//Ó direccionar a la página en caso de la versión web

	var ua = req.headers['user-agent'],
	    $ = {};
	if (/mobile/i.test(ua)){
		console.log("Caso MOBILE");
	}
	
	if (/like Mac OS X/.test(ua)) {
		console.log("Caso MACOSX");
	    res.redirect('doclinea://email_verification?email='+data.email+'&type='+data.type);
	    return;
	}
	
	if (/Android/.test(ua)){
		console.log("Caso Android");
		return;
	}
	
	if (/webOS\//.test(ua)){
		console.log("Caso WEBOS");
		return;
	}
	
	if (/(Intel|PPC) Mac OS X/.test(ua)){
		console.log("Caso INTEL PPC MACOSX");
		res.redirect('http://'+webapp+'/#/account_activation/'+data.type+'/'+data.email);
		return;
	}
	
	if (/Windows NT/.test(ua)){
		console.log("Caso WINDOWS NT");
		res.redirect('http://'+webapp+'/#/account_activation/'+data.type+'/'+data.email);
		return;
	}	
};
//Email Verifier*//
var emailVerification = function (req,data,type){
	//Encriptamos el correo del usuario
	var token = security.encrypt(data.email);
	//Lo encodeamos en base 64 para poderlo utilizar en la url
	var tokenB64 = security.base64(token);
	//Tomamos el correo sin encriptar y lo encodeamos en base 64
	var emailB64 = security.base64(data.email);
	//Formamos una url decifrable únicamente por nuestro sistema para poder verificar la autenticidad
	var url = 'http://'+hostname+'/api_1.0/Account/Verify/'+type+'/'+emailB64+'/'+tokenB64;
				mail.send("Verifica tu cuenta", mail_template.email_verification(data,url), data.email);
};
/////////////////////////////////
//End of Functions///////////////
/////////////////////////////////

/////////////////////////////////
//Password Redirect*/////////////
/////////////////////////////////
exports.passwordRedirect = function (req, res){
	//Este servicio redirige a la aplicación móvil ó a la versión web de doclinea
	//después de haber solicitado cambio de contraseña
	console.log("Password redirect function");
	var ua = req.headers['user-agent'],
	    $ = {};
	
	if (/mobile/i.test(ua)){
	console.log("Caso Mobile");
	}
	
	if (/like Mac OS X/.test(ua)) {
		console.log("Caso MACOSX");
	    res.redirect('doclinea://password_redirect?token='+req.params.token+'&type='+req.params.type+'&request='+req.params.request+'&email='+req.params.email);
	}
	
	if (/Android/.test(ua)){
		console.log("Caso Android");
	}
	
	if (/webOS\//.test(ua)){
		console.log("Caso WEBOS");
	}
	
	if (/(Intel|PPC) Mac OS X/.test(ua)){
		console.log("Caso INTEL PPC MAC");
		res.redirect('http://'+webapp+'/#/NewPassword/'+req.params.token+'/'+req.params.type+'/'+req.params.request+'/'+req.params.email);
	}
	
	if (/Windows NT/.test(ua)){
		console.log("Caso Windows");
		res.redirect('http://'+webapp+'/#/NewPassword/'+req.params.token+'/'+req.params.type+'/'+req.params.request+'/'+req.params.email);
	}
};
/////////////////////////////////
//End of Password Redirect///////
/////////////////////////////////