var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path')
  , model = require('./classes/model')
  , mail = require('./classes/mail_sender')
  , token = require('./classes/token')
  , authentication = require('./classes/authentication');
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
app.use(express.favicon(path.join(__dirname + '/public/images/favicon.png')));
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
//Verify
//app.all('/api_1.0/*', authentication.verifyHeader);

//Login
//app.post('/api_1.0/Login', model.adminLogin);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//User Create APIs
app.post('/api_1.0/User/SignUp', model.signUp);
//User Read APIs
app.get('/api_1.0/User/GetUserByEmail/:email', model.getUserByEmail);
app.get('/api_1.0/User/GetAllUsers', model.getAllUsers);
app.post('/api_1.0/User/AuthenticateUser', model.authenticateUser);
//User Update APIs
app.post('/api_1.0/User/UpdateUser', model.updateUser);
//User Delete APIs
app.post('/api_1.0/User/DeleteUser', model.deleteUser);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Doctor Create APIs
app.post('/api_1.0/Doctor/SignUp', model.doctorSignUp);
//Doctor Read APIs
app.get('/api_1.0/Doctor/GetDoctorByEmail/:email', model.getDoctorByEmail);
app.get('/api_1.0/Doctor/GetDoctorByID/:id', model.getDoctorByID);
app.get('/api_1.0/Doctor/GetAllDoctors', model.getAllDoctors);
app.post('/api_1.0/Doctor/GetDoctorsByParams', model.getDoctorsByParams);
app.post('/api_1.0/User/AuthenticateDoctor', model.authenticateDoctor);
//Doctor Update APIs
app.post('/api_1.0/Doctor/UpdateDoctor', model.updateDoctor);
//Doctor Delete APIs
app.post('/api_1.0/Doctor/DeleteDoctor', model.deleteDoctor);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Hospital Create APIs
app.post('/api_1.0/Hospital/Create', model.createHospital);
//Hospital Get APIs
app.get('/api_1.0/Hospital/GetHospitalByID/:id', model.getHospitalByID);
app.get('/api_1.0/Hospital/GetAllHospitals', model.getAllHospitals);
//Hospital Update APIs
app.post('/api_1.0/Hospital/UpdateHospital', model.updateHospital);
//Hospital Delete APIs
app.post('/api_1.0/Hospital/DeleteHospital', model.deleteHospital);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Hospital Create APIs
app.post('/api_1.0/InsuranceCompany/Create', model.createInsuranceCompany);
//Hospital Get APIs
app.get('/api_1.0/InsuranceCompany/GetInsuranceCompanyByID/:id', model.getInsuranceCompanyByID);
app.get('/api_1.0/InsuranceCompany/GetAllInsuranceCompany', model.getAllInsuranceCompanies);
//Hospital Update APIs
app.post('/api_1.0/InsuranceCompany/UpdateInsuranceCompany', model.updateInsuranceCompany);
//Hospital Delete APIs
app.post('/api_1.0/InsuranceCompany/DeleteInsuranceCompany', model.deleteInsuranceCompany);
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