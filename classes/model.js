var mongoose = require('mongoose');
var apn = require('apn');
var send_push = require('../classes/push_sender');
var utils = require('../classes/utils');
var fs = require('fs');
mongoose.connect("mongodb://iAmUser:iAmStudio1@ds061199.mongolab.com:61199/doclinea");
var express = require('express');
var knox = require('knox');
var gcm = require('node-gcm');
var excludepass = {password:0};

//Admin
var AdminSchema= new mongoose.Schema({
	name: {type: String, required: true,unique: false,},
	email: {type: String, required: true,unique: true,},
	password: {type: String, required: true,unique: false,},
	type: {type: String, required: true,unique: false,},
	role:{type: String, required: true,unique: false,},
}),
	Admin= mongoose.model('Admin',AdminSchema);

var UserSchema= new mongoose.Schema({
	email : {type: String, required:true, unique:true,},
	password : {type: String, required:true},
	name : {type: String, required:true},
	lastname : {type: String, required:false},
	gender : {type: String, required:false},
	phone : {type: String, required:false},
	country : {type: String, required:false},
	city : {type: String, required:false},
	address : {type: String, required:false},
	status : {type: Number, required:false},
	insurance : {type: String, required:false},
	verified : {type: Boolean, required:false},
	date_created : {type: Date, required:true},
	log : {type: Object, required:false},
	active_appointments : {type: Array, required:false},
	completed_appointments : {type: Array, required:false},
	canceled_appointments : {type: Array, required:false},
	devices : {type: Object, required:false},
}),
	User= mongoose.model('User',UserSchema);

var DoctorSchema= new mongoose.Schema({
	name : {type: String, required:true},
	password : {type: String, required:true},
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
	country : {type: String, required:false, unique:false,},
	location_list : {type: Array, required:false},
	hospital_list : {type: [Object], required:false},
	insurance_list : {type: [String], required:false},
	education_list : {type: [Object], required:false},
	profesional_membership : {type: Array, required:false},
	practice_list : {type: Array, required:false},
	profile_pic : {type: String, required:false},
	gallery : {type: [Object], required:false},
	overall_rating : {type: Number, required:false},
	review_list : {type: [Object], required:false},
	description : {type: String, required:false},
	language_list : {type: [Object], required:false},
}),
	Doctor= mongoose.model('Doctor',DoctorSchema);

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

var HospitalSchema= new mongoose.Schema({
	name : {type: String, required:false},
	location : {type: Object, required:false},
	address : {type: String, required:false},
	logo : {type: String, required:false},
}),
	Hospital= mongoose.model('Hospital',HospitalSchema);

var PracticeSchema= new mongoose.Schema({
	name : {type: String, required:false, unique: true},
	type : {type: String, required:false},
	reason_list : {type: Array, required:false},
}),
	Practice= mongoose.model('Practice',PracticeSchema);

var InsuranceCompanySchema= new mongoose.Schema({
	name : {type: String, required:false, unique: true},
	logo : {type: String, required:false},
}),
	InsuranceCompany= mongoose.model('InsuranceCompany',InsuranceCompanySchema);

var InsuranceTypeSchema= new mongoose.Schema({
	company_id : {type: String, required:false},
	name : {type: String, required:true},
}),
	InsuranceType= mongoose.model('InsuranceType',InsuranceTypeSchema);

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

//PRODUCTION AMAZON BUCKET
var client = knox.createClient({
    key: 'AKIAJNHMEXKKOP3TJXLA'
  , secret: 'UUzFqh+KmgwcpKwZ+0XYJFVOV54k21Y2vkBOhc6pNO'
  , bucket: 'eventoscaracol-assets'
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
exports.signUp = function(req,res){
console.log("Req: "+JSON.stringify(req.body));
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
	}).save(function(err,user){
		if(err){
			res.json(err);
		}
		else{
			res.json({status: true, message: "Usuario creado exitosamente."});
		}
	});
};
//Read One
exports.getUserByEmail = function(req,res){
	User.findOne({email:req.params.email},excludepass,function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: user});
		}
	});
};

exports.authenticateUser = function(req,res){
console.log("Req: "+JSON.stringify(req.body));
	User.findOne({email:req.body.email, password: req.body.password},excludepass,function(err,user){
		if(!user){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: user});
		}
	});
};
//Read All
exports.getAllUsers = function(req,res){
console.log("Cabecera: "+JSON.stringify(req.headers));
	User.find({},excludepass,function(err,users){
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
var filtered_body = utils.remove_empty(req.body);
	User.findOneAndUpdate({email:req.body.email},
	   {$set:filtered_body}, 
	   	function(err,user){
	   	if(!user){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	res.json({status:true, message:"Usuario actualizado exitosamente."});
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
exports.doctorSignUp = function(req,res){
console.log("Req: "+JSON.stringify(req.body));
var location = [];
location.push({lat: req.body.lat, lon: req.body.lon });
var practice = [];
practice.push(req.body.practice);
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
		country : req.body.country,
		practice_list : practice,
		location_list : location,
	}).save(function(err,doctor){
		if(err){
		console.log("Err: "+err);
			res.json(err);
		}
		else{
			res.json({status: true, message: "Doctor creado exitosamente."});
		}
	});
};
//Read One
exports.getDoctorByEmail = function(req,res){
	Doctor.findOne({email:req.params.email},excludepass,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: doctor});
		}
	});
};
exports.getDoctorByID = function(req,res){
	Doctor.findOne({_id:req.params.id},excludepass,function(err,doctor){
		if(!doctor){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: doctor});
		}
	});
};

//Read All
exports.getAllDoctors = function(req,res){
	Doctor.find({},excludepass,function(err,doctors){
		if(err){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: doctors});
		}
	});
};
exports.getDoctorsByParams = function(req,res){
console.log("Req: "+JSON.stringify(req.body));
var filtered_body = utils.remove_empty(req.body);
	Doctor.find(req.body,
		excludepass,function(err,doctors){
		if(doctors.length<=0){
			res.json({status: false, error: "not found"});
		}
		else{
			res.json({status: true, response: doctors});
		}
	});
};
//Update
exports.updateDoctor = function(req,res){
var filtered_body = utils.remove_empty(req.body);
	Doctor.findOneAndUpdate({email:req.body.email},
	   {$set:filtered_body}, 
	   	function(err,doctor){
	   	if(!doctor){
		   	res.json({status: false, error: "not found"});
	   	}
	   	else{
		   	res.json({status:true, message:"Usuario actualizado exitosamente."});
	   	}
	});
};
//Delete
exports.deleteDoctor = function(req,res){
	Doctor.remove({email:req.body.email},function(err){
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
	new Hospital({
		name : req.body.name,
		location : req.body.location,
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
	Hospital.findOne({_id:req.params.id},function(err,hospital){
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
	Hospital.findOneAndUpdate({_id:req.body.id},
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
			res.json(err);
		}
		else{
			res.json({status: true, message: "Compañía de seguros creada exitosamente."});
		}
	});
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
