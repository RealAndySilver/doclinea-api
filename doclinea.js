var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path')
  , model = require('./classes/model')
  , mail = require('./classes/mail_sender')
  , authentication = require('./classes/authentication')
  ,	security = require('./classes/security');
var app = express();
// all environments


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type , Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else{
	  next();  
    }
}

app.set('port', process.env.PORT || 1414);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { pretty: false });
app.use(allowCrossDomain);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/*', function(req, res, next){ 
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  next(); 
});

//Middleware to encode password
app.post('/api_1.0/User/Create', security.passwordEncrypt);
app.post('/api_1.0/Doctor/Create', security.passwordEncrypt);
app.post('/api_1.0/Doctor/NewPassword/*', security.passwordEncrypt);
app.post('/api_1.0/User/NewPassword/*', security.passwordEncrypt);

//////////////////////////////


app.get('/api_1.0/Password/Redirect/:type/:email/:request/:token', model.passwordRedirect);

//Verify
//app.all('/api_1.0/*', authentication.verifyHeader);

//Login
//app.post('/api_1.0/Login', model.adminLogin);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//User Create APIs
app.post('/api_1.0/User/Create', model.createUser);
//User Read APIs
app.get('/api_1.0/User/GetByEmail/:email', model.getUserByEmail);
app.get('/api_1.0/User/GetByID/:id', model.getUserByID);
app.get('/api_1.0/User/GetAll', model.getAllUsers);
app.post('/api_1.0/User/Authenticate', model.authenticateUser);
//User Update APIs
app.post('/api_1.0/User/Update/:user_id', model.updateUser);
//User Delete APIs
app.post('/api_1.0/User/Delete', model.deleteUser);
//Change Password
app.post('/api_1.0/User/ChangePassword/:user_id', model.changePasswordUser);
//User Recover Password
app.get('/api_1.0/User/Recover/:user_email', model.requestRecoverUser);
app.post('/api_1.0/User/NewPassword/:token', model.newPasswordUser);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Doctor Create APIs
app.post('/api_1.0/Doctor/Create', model.createDoctor);
app.post('/api_1.0/Doctor/AddPicToGallery/:doctor_id', model.addPicToGallery);
//Doctor Read APIs
app.get('/api_1.0/Doctor/GetByEmail/:email', model.getDoctorByEmail);
app.get('/api_1.0/Doctor/GetByID/:id', model.getDoctorByID);
app.get('/api_1.0/Doctor/GetAll', model.getAllDoctors);
app.post('/api_1.0/Doctor/GetByParams', model.getDoctorsByParams);
app.post('/api_1.0/Doctor/Authenticate', model.authenticateDoctor);
//Doctor Update APIs
app.post('/api_1.0/Doctor/Update/:doctor_id', model.updateDoctor);
app.post('/api_1.0/Doctor/UpdateProfilePic/:doctor_id', model.updateProfilePic);
//Doctor Delete APIs
app.post('/api_1.0/Doctor/RemoveGalleryPic/:doctor_id', model.removeGalleryPic);
app.post('/api_1.0/Doctor/Delete', model.deleteDoctor);
//Doctor Recover Password
app.get('/api_1.0/Doctor/Recover/:doctor_email', model.requestRecoverDoctor);
app.post('/api_1.0/Doctor/NewPassword/:token', model.newPasswordDoctor);
//Change Password
app.post('/api_1.0/Doctor/ChangePassword/:doctor_id', model.changePasswordDoctor);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Hospital Create APIs
app.post('/api_1.0/Hospital/Create', model.createHospital);
//Hospital Get APIs
app.get('/api_1.0/Hospital/GetByID/:hospital_id', model.getHospitalByID);
app.get('/api_1.0/Hospital/GetAll', model.getAllHospitals);
//Hospital Update APIs
app.post('/api_1.0/Hospital/Update/:hospital_id', model.updateHospital);
app.post('/api_1.0/Hospital/UpdatePic/:hospital_id', model.updateHospitalPic);
//Hospital Delete APIs
app.post('/api_1.0/Hospital/Delete', model.deleteHospital);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//InsuranceCompany Create APIs
app.post('/api_1.0/InsuranceCompany/Create', model.createInsuranceCompany);
app.post('/api_1.0/InsuranceCompany/AddInsuranceType/:insuranceCompanyID', model.addInsurancetype);
//InsuranceCompany Get APIs
app.get('/api_1.0/InsuranceCompany/GetByID/:id', model.getInsuranceCompanyByID);
app.get('/api_1.0/InsuranceCompany/GetAll', model.getAllInsuranceCompanies);
//InsuranceCompany Update APIs
app.post('/api_1.0/InsuranceCompany/Update', model.updateInsuranceCompany);
app.post('/api_1.0/InsuranceCompany/UpdatePic/:insurancecompany_id', model.updateInsuranceCompanyPic);
//InsuranceCompany Delete APIs
app.post('/api_1.0/InsuranceCompany/RemoveInsuranceType/:id', model.removeInsuranceType);
app.post('/api_1.0/InsuranceCompany/Delete', model.deleteInsuranceCompany);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Practice Create APIs
app.post('/api_1.0/Practice/Create', model.createPractice);
app.post('/api_1.0/Practice/AddAppointmentReason/:practice_id', model.addAppointmentReason);
//Practice Get APIs
app.get('/api_1.0/Practice/GetByID/:practice_id', model.getPracticeByID);
app.get('/api_1.0/Practice/GetAll', model.getAllPractices);
//Practice Update APIs
app.post('/api_1.0/Practice/Update', model.updatePractice);
//Practice Delete APIs
app.post('/api_1.0/Practice/RemoveAppointmentReason/:practice_id', model.removeAppointmentReason);
app.post('/api_1.0/Practice/Delete', model.deletePractice);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////


//Create APIs
app.post('/api_1.0/CreateAdmin', model.createAdmin);

//Update APIs
app.post('/api_1.0/Admin/UpdateAdmin', model.updateAdmin);

//Delete APIs
app.get('/api_1.0/DeleteAdmin/:admin_id/:super_admin_id', model.deleteAdmin);

//Mobile APIs

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});