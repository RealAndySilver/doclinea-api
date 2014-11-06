//////////////////////////////////
//Dependencies////////////////////
//////////////////////////////////
var mongoose = require('mongoose');
var apn = require('apn');
var send_push = require('../classes/push_sender');
var utils = require('../classes/utils');
var mail = require('../classes/mail_sender');
var fs = require('fs');
mongoose.connect("mongodb://iAmUser:iAmStudio1@ds061199.mongolab.com:61199/doclinea");
var express = require('express');
var knox = require('knox');
var gcm = require('node-gcm');
var	security = require('../classes/security');
var colors = require('colors');
//////////////////////////////////
//End of Dependencies/////////////
//////////////////////////////////

//////////////////////////////////
//Global Vars/////////////////////
//////////////////////////////////
var exclude = {/*password:0*/};
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
var UserSettings = new mongoose.Schema({email_appointment_notifications:Boolean, email_marketing_notifications:Boolean, mobile_appointment_notifications:Boolean, mobile_marketing_notifications:Boolean}, {_id:false});

//////////////////////////////////
//End SubDocumentSchema///////////
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
	settings: {type: [UserSettings], required:false},
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
	password_recover : {status: {type: Boolean}, token:{type:String}},
	lastname : {type: String, required:true},
	email : {type: String, required:true, unique:true,},
	gender : {type: String, required:true},
	patient_gender : {type: Number, required:true}, //1 male, 2 female, 3 both
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
	user_id : {type: String, required:true},
	doctor_id : {type: String, required:true},
	date_created : {type: Date, required:true},
	appointment_length : {type: Number, required:true},
	type : {type: String, required:false},
	status : {type: String, required:false},
	reason : {type: String, required:false},
	date_start : {type: Date, required:true},
	location : {type: Object, required:true},
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
	name : {type: String, required:false},
	location : {type: {type: String}, 'coordinates':{type:[Number]}},
	address : {type: String, required:false},
	logo : {type: String, required:false},
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
	name : {type: String, required:false, unique: true},
	logo : {type: String, required:false},
	type_list: {type: [TypeSchema], required:false},
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
//Create
exports.createUser = function(req,res){
var device_array = [];
if(req.body.device_info){
	req.body.device_info = utils.isJson(req.body.device_info) ? JSON.parse(req.body.device_info): req.body.device_info ;
	device_array.push(req.body.device_info);
}
utils.log("User/Create","Recibo:",JSON.stringify(req.body));
	new User({
		email : req.body.email,
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
			utils.log("User/Create","Envío:",JSON.stringify(user));
			res.json({status: true, message: "Usuario creado exitosamente.", response: user});
		}
	});
};
//Read One
exports.getUserByEmail = function(req,res){
	User.findOne({email:req.params.email},exclude,function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: user});
		}
	});
};
exports.authenticateUser = function(req,res){
utils.log("User/Authenticate","Recibo:",JSON.stringify(req.body));
	User.findOne({email:req.body.email},exclude,function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			//Verificamos que el hash guardado en password sea igual al password de entrada
			if(security.compareHash(req.body.password, user.password)){
				//Acá se verifica si llega device info, y se agrega al device list del usuario
				//En este punto ya se encuentra autenticado el usuario, las respuestas siempre serán positivas
				if(req.body.device_info){
					utils.log("User/Authenticate","Envío:",JSON.stringify(user));
					req.body.device_info = utils.isJson(req.body.device_info) ? JSON.parse(req.body.device_info): req.body.device_info ;
					User.findOneAndUpdate({email:req.body.email}, {$addToSet:{devices:req.body.device_info}}, function(err,new_user){
						if(!err){
							if(!new_user){
								res.json({status: true, response: user, message:"Autenticado correctamente, pero no se pudo agregar el dispositivo"});
							}
							else{
								res.json({status: true, response: new_user});
							}
						}
						else{
								res.json({status: true, response: user, message:"Autenticado correctamente, pero ocurrió un error.", error:err});
						}
					});
				}
				else{
					res.json({status: true, response: user});
				}
			}
			else{
				res.json({status: false, error: "not found"});
			}
		}
	});
};
//Read All
exports.getAllUsers = function(req,res){
	User.find({},exclude,function(err,users){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: users});
		}
	});
};
//Update
exports.updateUser = function(req,res){
req.body._id = '';
req.body.email = '';
var filtered_body = utils.remove_empty(req.body);
utils.log("User/Update","Recibo:",JSON.stringify(filtered_body));
	User.findOneAndUpdate({_id:req.params.user_id},
	   {$set:filtered_body}, 
	   	function(err,user){
	   	if(!user){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
	   		utils.log("User/Create","Envío:",JSON.stringify(user));
		   	res.json({status:true, message:"Usuario actualizado exitosamente.", response:user});
	   	}
	});
};
//Password
exports.requestRecoverUser = function(req,res){
	utils.log("User/Recover","Recibo:",req.params.user_email);
	User.findOne({email:req.params.user_email},function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			var token = security.encrypt(user.email);
			var tokenB64 = security.base64(token);
			user.password_recover = {status:true, token:token};
			user.save(function(err, result){
				if(err){
					res.json({status: false, error: err});
				}
				else{
					if(result){
						//mail.send("Token: "+token, doctor.email);
						var hostname = req.headers.host;
						var url = 'http://'+hostname+'/api_1.0/Password/Redirect/user/'+user.email+'/new_password/'+tokenB64;
						//var url2= "doclinea://?token="+tokenB64+"&type=doctor&request=new_password";
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
	var token_decoded = security.decodeBase64(req.params.token);
	utils.log("User/NewPassword","Recibo:",token_decoded);
	User.findOne({password_recover:{status:true, token: token_decoded}},function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			user.password_recover.status = false;
			user.password_recover.token = "";
			user.password = req.body.password;
			user.save(function(err, result){
				if(err){
					
				}
				else{
					if(result){
						//mail.send("Clave Cambiada Con Exito");
						mail.send("Clave Cambiada Con Exito!", "Hola "+user.name+". <br>Tu contraseña ha sido cambiada con éxito. Ingresa ya a Doclinea:<br> <a href='http://doclinea.com'> Doclinea </a>", user.email);
						res.json({status: true, response: result});
					}
				}
			});
		}
	});
};
exports.changePasswordUser = function(req,res){
utils.log("User/ChangePassword","Recibo:",JSON.stringify(req.body));
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
						utils.log("User/ChangePassword","Error:",JSON.stringify(err));
						res.json({status: false, error: err, message: "Ocurrió un error al actualizar la contraseña."});
					}
					else{
						utils.log("User/ChangePassword","Envío:",JSON.stringify(user));
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
	User.remove({email:req.body.email},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Usuario borrado exitosamente."});
		}
	});
};
//////////////////////////////////
//End of User CRUD///////////////
//////////////////////////////////

//////////////////////////////////
//Doctor CRUD starts here//////////
//////////////////////////////////
//Create
exports.createDoctor = function(req,res){
utils.log("Doctor/Create","Recibo:",JSON.stringify(req.body));

var location_list = [];
var location = {};
var coordinates = [];
if(req.body.lat && req.body.lon){
	coordinates.push(req.body.lon);
	coordinates.push(req.body.lat);
	location_list.push({location_address:req.body.location_address, location_name:req.body.location_name, lat:req.body.lat, lon:req.body.lon});
	location = {loc:{type:'Point', coordinates: coordinates}};
}
else{
	coordinates.push(0);
	coordinates.push(0);
	location = {loc:{type:'Point', coordinates: coordinates}};
}
if(req.body.localidad){
	req.body.localidad = utils.isJson(req.body.localidad) ? JSON.parse(req.body.localidad): req.body.localidad ;
}
var practice_list = [];
practice_list.push(req.body.practice_list);


	new Doctor({
		name : req.body.name,
		status : false,
		password : req.body.password,
		lastname : req.body.lastname,
		email : req.body.email,
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
			utils.log("User/Create","Envío:",JSON.stringify(doctor));
			res.json({status: true, message: "Doctor creado exitosamente.", response: doctor});
		}
	});
};
exports.addPicToGallery = function(req,res){
utils.log("User/AddPicToGallery","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({_id:req.params.doctor_id},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			utils.log("User/AddPicToGallery","Envio:",JSON.stringify(doctor));
			uploadImage(req.files.image,doctor,"gallery", 'doctor');
			res.json({status: true, response: 'update in progress, get doctor again to see results'})
		}
	});
};
//Read One
exports.getDoctorByEmail = function(req,res){
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
utils.log("User/GetByID","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({_id:req.params.id},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			utils.log("User/GetByID","Envío:",JSON.stringify(doctor));
			res.json({status: true, response: doctor});
		}
	});
};
//Read All
exports.getAllDoctors = function(req,res){
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
var filtered_body = utils.remove_empty(req.body);

var query = {};
query = req.body;
var meters = parseInt(req.body.meters);
delete req.body.meters;
if(req.body.lat && req.body.lon){
	query.location = {$near :{$geometry :{type : "Point" ,coordinates :[req.body.lon, req.body.lat]},$maxDistance : meters}};	
}
if(query.name){
	query.name = utils.regexForString(query.name);
}
if(query.lastname){
	query.lastname = utils.regexForString(query.lastname);
}
delete query.lat;
delete query.lon;
utils.log("User/GetByParams","Recibo:",JSON.stringify(query));
	Doctor.find(query,
		exclude,
		function(err,doctors){
		if(!err){
			if(doctors.length<=0){
				res.json({status: false, error: "not found"});
			}
			else{
				utils.log("User/GetByParams","Envío:",JSON.stringify(doctors));
				res.json({status: true, response: doctors});
			}
		}
		else{
			res.json({status: false, error: err});
		}
	});
};
//Update
exports.updateDoctor = function(req,res){
req.body._id='';
req.body.email = '';
var location_list = [];
var location = {};
var coordinates = [];
//utils.log("Doctor/Update","Recibo:",JSON.stringify(req.body));

if(req.body.localidad){
	req.body.localidad = utils.isJson(req.body.localidad) ? JSON.parse(req.body.localidad): req.body.localidad ;
}
if(req.body.education_list){
	req.body.education_list = utils.isJson(req.body.education_list) ? JSON.parse(req.body.education_list): req.body.education_list ;
}
if(req.body.location_list){
	req.body.location_list = utils.isJson(req.body.location_list) ? JSON.parse(req.body.location_list): req.body.location_list ;
}

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
if (req.body.education_list){
	if(req.body.education_list[0] == 0){
		req.body.education_list = [];
	}
}
utils.log("Doctor/Update","Recibo:",JSON.stringify(filtered_body));

	Doctor.findOneAndUpdate({_id:req.params.doctor_id},
	   {$set:filtered_body},
	   	function(err,doctor){
	   	if(!doctor){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
	   		utils.log("Doctor/Update","Envío:",JSON.stringify(doctor));
		   	res.json({status:true, message:"Doctor actualizado exitosamente.", response:doctor});
	   	}
	});
};
exports.updateProfilePic = function(req,res){
utils.log("Doctor/UpdateProfilePic","Recibo:",JSON.stringify(req.files));

	Doctor.findOne({_id:req.params.doctor_id},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			utils.log("Doctor/UpdateProfilePic","Envío:",JSON.stringify(doctor));
			uploadImage(req.files.image,doctor,"profile", 'doctor');
			res.json({status: true, response: 'update in progress, get doctor again to see results'})
		}
	});
};
exports.authenticateDoctor = function(req,res){
utils.log("Doctor/Authenticate","Recibo:",JSON.stringify(req.body));
	Doctor.findOne({email:req.body.email},exclude,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			//Verificamos que el hash guardado en password sea igual al password de entrada
			if(security.compareHash(req.body.password, doctor.password)){
				utils.log("Doctor/Authenticate","Envío:",JSON.stringify(doctor));
				doctor.password_recover.status = false;
				doctor.password_recover.token = "";
				doctor.save(function(err, result){
					res.json({status: true, response: doctor});
				});
			}
			else{
				res.json({status: false, error: "not found"});
			}
		}
	});
};
//Password
exports.requestRecoverDoctor = function(req,res){
	utils.log("Doctor/Recover","Recibo:",req.params.doctor_email);
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
						//mail.send("Token: "+token, doctor.email);
						var hostname = req.headers.host;
						var url = 'http://'+hostname+'/api_1.0/Password/Redirect/doctor/'+doctor.email+'/new_password/'+tokenB64;
						//var url2= "doclinea://?token="+tokenB64+"&type=doctor&request=new_password";
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
	var token_decoded = security.decodeBase64(req.params.token);
	utils.log("Doctor/NewPassword","Recibo:",token_decoded);
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
						//mail.send("Clave Cambiada Con Exito");
						mail.send("Clave Cambiada Con Exito!", "Hola "+doctor.name+". <br>Tu contraseña ha sido cambiada con éxito. Ingresa ya a Doclinea:<br> <a href='http://doclinea.com'> Doclinea </a>", doctor.email);
						res.json({status: true, response: result});
					}
				}
			});
		}
	});
};
exports.changePasswordDoctor = function(req,res){
utils.log("Doctor/ChangePassword","Recibo:",JSON.stringify(req.body));
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
						utils.log("Doctor/ChangePassword","Error:",JSON.stringify(err));
						res.json({status: false, error: err, message: "Ocurrió un error al actualizar la contraseña."});
					}
					else{
						utils.log("User/ChangePassword","Envío:",JSON.stringify(doctor));
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
	utils.log("Doctor/RemoveGalleryPic","Recibo:",JSON.stringify(req.body));
	Doctor.findOneAndUpdate(
	    {_id: req.params.doctor_id},
	    {$pull: {gallery: {name:req.body.name}}},
	    {multi: true},
	    function(err, doctor) {
	    	if(!doctor){
		    	res.json({status:false, message: 'Error al borrar'});
	    	}
	    	else{
				utils.log("Doctor/RemoveGalleryPic","Envío:",JSON.stringify(doctor));
	        	res.json({status:true, message: 'Borrado' ,response:doctor});
	    	}
	    }
	);
};
exports.deleteDoctor = function(req,res){
	Doctor.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Usuario borrado exitosamente."});
		}
	});
};
//////////////////////////////////
//End of Doctor CRUD//////////////
//////////////////////////////////

//////////////////////////////////
//Hospital CRUD starts here///////
//////////////////////////////////
//Create
exports.createHospital = function(req,res){
var location = {};
var coordinates = [];
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
	}).save(function(err,hospital){
		if(err){
			res.json(err);
		}
		else{
			res.json({status: true, message: "Hospital creado exitosamente."});
		}
	});
};
//Read One
exports.getHospitalByID = function(req,res){
	Hospital.findOne({_id:req.params.hospital_id},function(err,hospital){
		if(!hospital){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: hospital});
		}
	});
};
//Read All
exports.getAllHospitals = function(req,res){
	User.find({},function(err,hospitals){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: hospitals});
		}
	});
};
//Update
exports.updateHospital = function(req,res){
var filtered_body = utils.remove_empty(req.body);
	Hospital.findOneAndUpdate({_id:req.params.hospital_id},
	   {$set:filtered_body}, 
	   	function(err,hospital){
	   	if(!hospital){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	res.json({status:true, message:"Hospital actualizado exitosamente."});
	   	}
	});
};
//Delete
exports.deleteHospital = function(req,res){
	Hospital.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Hospital borrado exitosamente."});
		}
	});
};
//////////////////////////////////
//End of Hospital CRUD////////////
//////////////////////////////////

//////////////////////////////////////
//InsuranceCompany CRUD starts here///
//////////////////////////////////////
//Create
exports.createInsuranceCompany = function(req,res){
	new InsuranceCompany({
		name : req.body.name,
	}).save(function(err,insurancecompany){
		if(err){
			res.json({status: false, error: "Error. no se pudo crear la compañía de seguros"});
		}
		else{
			res.json({status: true, message: "Compañía de seguros creada exitosamente.", response:insurancecompany});
		}
	});
};
exports.addInsurancetype = function(req,res){
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
//Read One
exports.getInsuranceCompanyByID = function(req,res){
	InsuranceCompany.findOne({_id:req.params.id},function(err,insurancecompany){
		if(!insurancecompany){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: insurancecompany});
		}
	});
};
//Read All
exports.getAllInsuranceCompanies = function(req,res){
	InsuranceCompany.find({},function(err,insurancecompany){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: insurancecompany});
		}
	});
};
//Update
exports.updateInsuranceCompany = function(req,res){
var filtered_body = utils.remove_empty(req.body);
	InsuranceCompany.findOneAndUpdate({_id:req.body.id},
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
//Delete
exports.removeInsuranceType = function(req,res){
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
	InsuranceCompany.remove({_id:req.body.id},function(err){
		if(err){
			res.json(error.notFound);
		}
		else{
			res.json({status:true, message:"Compañía de seguros borrada exitosamente."});
		}
	});
};
//////////////////////////////////
//End of InsuranceCompany CRUD////
//////////////////////////////////

//////////////////////////////////////
//Practice CRUD starts here///////////
//////////////////////////////////////
//Create
exports.createPractice = function(req,res){
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
//Read One
exports.getPracticeByID = function(req,res){
	Practice.findOne({_id:req.params.practice_id},function(err,practice){
		if(!practice){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: practice});
		}
	});
};
//Read All
exports.getAllPractices = function(req,res){
	Practice.find({},function(err,practices){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: practices});
		}
	});
};
//Update
exports.updatePractice = function(req,res){
var filtered_body = utils.remove_empty(req.body);
	Practice.findOneAndUpdate({_id:req.body.id},
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
//Delete
exports.removeAppointmentReason = function(req,res){
	Practice.findOneAndUpdate(
	    {_id: req.params.practiceID},
	    {$pull: {type_list: {_id:req.body.reason_id}}},
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
//End of InsuranceCompany CRUD////
//////////////////////////////////

//////////////////////////////////
//Send Push Notification//////////
//////////////////////////////////
exports.sendPush = function (req,res){
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
								
								// If you plan on sending identical paylods to many devices you can do something like this.
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
								//console.log("enviar push a: "+tokens_array);
							});
						}
					});
				}
				if(android){
					PushToken.find({app_id:req.body.app_id, device_brand:"Android"}, function(err,pushtokens){
						if(pushtokens.length<=0){
						}
						else{
							// or with object values
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
									
									// OPTIONAL
									// add new key-value in data object
									//message.addDataWithKeyValue('key1','message1');
									//message.addDataWithKeyValue('key2','message2');
									
									// or add a data object
									message.addDataWithObject({
									    message: req.body.message,
									    app_name: app.name,
									});
									
									message.collapseKey = 'demo';
									message.delayWhileIdle = true;
									message.timeToLive = 3;
									// END OPTION
									
									// At least one required
									for(var i=0;i<pushtokens.length;i++){
										registrationIds.push(pushtokens[i].push_token);		
									}					
									/**
									 * Params: message-literal, registrationIds-array, No. of retries, callback-function
									 **/
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
var uploadImage = function(file,object,type,owner){
	if(!file){
		object.profile_pic = {name:"", image_url: ""};
		object.save(function(err,doctor){
		});
		console.log('No hay archivo');
		return;
	} 
	var tmp_path_image_url = file.path;
    var extension =".jpg";
    if(file.type=="image/png"){
    	extension=".png";
    }
	var target_path_image_url = './public/images/' + file.size + file.name;    
    if(file.size>0){
		fs.renameSync(tmp_path_image_url,target_path_image_url);		
		fs.stat(target_path_image_url, function(err, stat){
		  // Be sure to handle `err`.
			if(err){
				console.log("error1 "+err);
			}
			else{
				console.log("Objeto: "+object.email);
				var req = client.put(owner+'/'+object.email+'/'+type+"/"+file.name, {
					      'Content-Length': stat.size,
					      'Content-Type': file.type,
					      'x-amz-acl': 'public-read'
				});
				fs.createReadStream(target_path_image_url).pipe(req);
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
						}
					});
			  });
			}
		});
	}
    else{
	    console.log('no hay imagen');
    }
}
/////////////////////////////////
//End of Functions///////////////
/////////////////////////////////

/////////////////////////////////
//Password Redirect//////////////
/////////////////////////////////
exports.passwordRedirect = function (req, res){
	var ua = req.headers['user-agent'],
	    $ = {};
	
	if (/mobile/i.test(ua)){
	
	}
	
	if (/like Mac OS X/.test(ua)) {
	    res.redirect('doclinea://?token='+req.params.token+'&type='+req.params.type+'&request='+req.params.request+'&email='+req.params.email);
	}
	
	if (/Android/.test(ua)){
	
	}
	
	if (/webOS\//.test(ua)){
		
	}
	
	if (/(Intel|PPC) Mac OS X/.test(ua)){
		res.redirect('http://localhost:3000/#/NewPassword/'+req.params.token+'/'+req.params.type+'/'+req.params.request+'/'+req.params.email);
	}
	
	if (/Windows NT/.test(ua)){
		
	}
};
/////////////////////////////////
//End of Password Redirect///////
/////////////////////////////////