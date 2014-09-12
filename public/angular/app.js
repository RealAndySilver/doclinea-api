(function(){
	
	var app =  angular.module('service',[]);
	
	var endpoint = "http://192.241.187.135:1414/api_1.0/";	
	
	app.controller('ServiceController',['$http',function($http){
		
		this.authenticateUser = function(email, password){
			var service = this;
			var type = "User"
			service.data = [];
			$http.get(endpoint + '/' + type + '/GetUserByEmail/' + email).success(function(data){
				console.log(data.status);
				service.data = data.response;
			}).error(function(error){
				console.log(error);
			});
		};
		
		this.processForm = function() {
			var data1 = this.data;
			$http.post(endpoint + '/' + type + '/AuthenticateUser', data1)
		        .success(function(data) {
		            if (data.status) {
		            	
		            } else {
		            	
		            }
	        });
	        this.data = {};
		};
		
		this.getDoctorByEmail = function(practice, locale, insCmpny){
			var service = this;
			var type = "Doctor"
			service.data = [];
			//loading
			$http.get(endpoint + '/' + type + '/GetDoctorBy/' + practice + '/' + locale + '/' + insCmpny).success(function(data){
				console.log(data.status);
				service.data = data.response;
				//mostrar el nuevo view
				
			}).error(function(error){
				console.log(error);
			});
		};
		
		this.getAllUsers = function(){
			var service = this;
			var type = "User"
			service.data = {};
			$http.get(endpoint + '/' + type + '/GetAllUsers').success(function(data){
				console.log(data.status);
				if(data.status){
					service.data = data.response;
					return;
				}
				else{
					console.log('Error, empty');
					return;
				}
			}).error(function(error){
				console.log(error);
			});
		};
		
	}]);
	
})();