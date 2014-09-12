//Token Addition
var number = 10*100*1000*10000;
exports.dashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/Dashboard/'+req.params.admin_id+'/'+'token='+token);
	//next();
};
exports.appDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/AppDashboard/'+req.params.app_id+'/'+req.params.admin_id+'/'+req.params.app_name+'/'+'token='+token);
	//next();
};
exports.itemDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/ItemDashboard/'+req.params.menuItem_id+'/'+req.params.app_id+'/'+req.params.admin_id+'/'+'token='+token);
	//next();
};
exports.locationDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/LocationDashboard/'+req.params.menuItem_id+'/'+req.params.app_id+'/'+req.params.admin_id+'/'+'token='+token);
	//next();
};
exports.categoryDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/CategoryDashboard/'+req.params.app_id+'/'+req.params.admin_id+'/'+'token='+token);
	//next();
};
exports.categoryFatherDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/CategoryFatherDashboard/'+req.params.app_id+'/'+req.params.admin_id+'/'+'token='+token);
	//next();
};
exports.categorySonDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/CategorySonDashboard/'+req.params.app_id+'/'+req.params.admin_id+'/'+req.params.categoryfather_id+'/'+'token='+token);
	//next();
};
exports.pushDashboardToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/SendPushBroadcast/'+req.params.app_id+'/'+req.params.admin_id+'/'+'token='+token);
	//next();
};
exports.getAllInfoWithAppIDToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/GetAllInfoWithAppID/'+req.params.app_id+'/'+'token='+token);
	//next();
};
exports.getAllInfoWithAppIDTokenProtected = function(req,res,next){
console.log("yahoooo");
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/api_1.0/GetAllInfoWithAppID/'+req.params.app_id+'/'+'token='+token);
	//next();
};
exports.appUpdaterViewToken = function(req,res,next){
	var token = Math.floor(Math.random() * (number - 1) + 1);
	res.redirect('/AppUpdater/'+req.params.admin_id+'/'+req.params.app_id+'/'+'token='+token);
	//next();
};