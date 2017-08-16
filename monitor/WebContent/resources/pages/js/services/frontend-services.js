angular.module('frontendServices', [])
loginApp.service("authenticationSvc", ["$http","$q","$window","$rootScope",function ($http, $q, $window,$rootScope) {
	var user = null;
	return{
		 login : function(postData){
				var deferred = $q.defer();
				$http({
					method :'POST',
					url :'/auth/login',
					data : postData
				}).error(function(error){
					
					deferred.resolve("Invalid Username or Password");
				}).then(function(response){
					if(response.status ==200){
						deferred.resolve(response);
					}else{
						deferred.resolve(response);
						
					}
				})
				
				return deferred.promise;
				
			},
	logout : function(){
		var deferred = $q.defer();
		$http({
			method :'POST',
			url :'/login',
			headers :{
				'Authentication' :userInfo.accessToken
			}
		}).then(function(response){
			
		})
		return deferred.promise;
	},
	}
	
}]);
