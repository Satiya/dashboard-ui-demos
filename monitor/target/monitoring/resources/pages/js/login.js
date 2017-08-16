var loginApp = angular.module('loginApp', ['ui.router','frontendServices','ngMessages','directive.g+signin','googleplus']);
loginApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider,GooglePlus) {
	
	$urlRouterProvider.otherwise('/');
	$stateProvider
	.state('home', {
				url : '/',
				templateUrl : '/Monitoring-UI/resources/pages/home.html',
				controller : 'loginCtrl'
			}).state('userRegistraion', {
				url : '/userRegistraion',
				templateUrl : '/Monitoring-UI/resources/pages/register.html',
				controller : 'registerCtrl'
			})
	
}]);


loginApp.controller('loginCtrl', function($scope, $http, $location, $stateParams,authenticationSvc,$rootScope,GooglePlus ) {
	
	
	var fieldWithFocus;

     $scope.userDetails = {
         submitted: false,
         errorMessages: []
     };

     $scope.focus = function (fieldName) {
         fieldWithFocus = fieldName;
     };

     $scope.blur = function (fieldName) {
         fieldWithFocus = undefined;
     };

     $scope.isMessagesVisible = function (fieldName) {
         return fieldWithFocus === fieldName || $scope.userDetails.submitted;
     };
	$scope.userDetails = {
			
			fullName : "",
			emailId : "",
			userName : "",
			password : ""
			
	}
  
	var canaryId = localStorage.getItem("canaryId");
     
	//localStorage.removeItem("canaryId");
	$scope.showErrorLogin = false;
	$scope.onLogin = function(){
		
		/*$scope.vm.mail = null;
		  $scope.vm.password = null;*/
		
		var postData = {
				userName : $scope.vm.mail,
				password :$scope.vm.password
		};
		authenticationSvc.login(postData).then(function(response){
			if(!angular.isUndefined(response.data)){
				
				localStorage.setItem("webToken",response.data.token);
				if(canaryId == "null#/" || canaryId == null || canaryId == "null"){
					window.location.replace("monitoring_web/resources/pages/dashboard.html");
					localStorage.setItem("userName",$scope.vm.mail);
				}
			} else{
				$scope.showErrorLogin = true;
				$scope.errorMessage = response;
				$scope.vm.mail = '';
				$scope.vm.password = '';
				
			}
		})
	}
	
	/* Google sign in */
	 
    $scope.login = function () {
      GooglePlus.login().then(function (authResult) {
       GooglePlus.getUser().then(function (user) {
    	   localStorage.setItem("webToken",authResult.access_token);
          //  localStorage.setItem("userName",user.name);
    	   $scope.googleStatus = authResult.status.google_logged_in;
            $scope.fullName = user.name;
            $scope.emailId = user.email;
            $scope.userName = user.given_name;
            var gmailData = {
            		fullName :  $scope.fullName,
            		emailId  : $scope.emailId,
            		userName : $scope.userName,
            		password : "",
            };
            
            $http({
            	method : "POST",
            	url : "http://172.9.239.142:8090/canaries/saveCanaryUserProfile",
            	data: gmailData,
            	headers : {
            		'Accept' : 'application/json',
            		'Content-Type' : 'application/json'
            	},
            }).success(function(response) {
            	
            	var postData = {
            			emailId : $scope.emailId,
            			isGoogleSignIn : $scope.googleStatus
            	};
            	
            	authenticationSvc.login(postData).then(function(response){
        			if(!angular.isUndefined(response.data)){
        				
        				localStorage.setItem("webToken",response.data.token);
        				if(canaryId == "null#/" || canaryId == null || canaryId == "null"){
        					window.location.replace("/opsmx-analysis/public/config.html");
        					localStorage.setItem("userName",$scope.userName);
        					
        				}else{
        					
        					window.location.replace("/opsmx-analysis/public/canaryAnalysis.html?canaryId="+canaryId);
        					localStorage.setItem("userName",$scope.userName);
        				}
        				$scope.resp = "successfully submitted";
        			} else{
        				$scope.showErrorLogin = true;
        				$scope.errorMessage = response;
        				//$scope.vm.mail = '';
        				//$scope.vm.password = '';
        				
        			}
        		})
            	$scope.resp = "successfully submitted";
            }).error(function(error) {
            	$scope.error = "please enter the following details";
            })
      });
       }, function (err) {
       });
     };
	
	
	$scope.logout = function(){
		window.location.replace("/opsmx-analysis/public/login.html");
	}
	
	$scope.onRegister = function(){
		
		
		
	/*	$scope.showErrorRegister = false;
		$scope.userDetails.submitted = true;
		
		 if ($scope.userForm.$invalid) {
             return;
         }
		 if ($scope.userForm.$valid){
			$http.post("http://172.9.239.142:8090/canaries/saveCanaryUserProfile", $scope.userDetails).success(function(response){
				var message = response.status;
					if(message.includes("exists")){
						$scope.showErrorRegister = true;	
					$scope.registerMessage = response.status;
				}else {
					$scope.showErrorRegister = false;
					window.location.replace("/opsmx-analysis/public/login.html");
				}
			$scope.registerData = response.status;
		}).error(function(response){
			$scope.registerData = response.status;
			
		});
		 }*/
	}
 });

loginApp.controller('registerCtrl', function($scope, $http, $location, $stateParams,authenticationSvc,$rootScope,GooglePlus) {
	
	 $(function () {
		    $('input').iCheck({
		      checkboxClass: 'icheckbox_square-blue',
		      radioClass: 'iradio_square-blue',
		      increaseArea: '20%' // optional
		    });
		  });
	 
	 $scope.onRegister = function(){
			
			
			
			/*	$scope.showErrorRegister = false;
				$scope.userDetails.submitted = true;
				
				 if ($scope.userForm.$invalid) {
		             return;
		         }
				 if ($scope.userForm.$valid){
					$http.post("http://172.9.239.142:8090/canaries/saveCanaryUserProfile", $scope.userDetails).success(function(response){
						var message = response.status;
							if(message.includes("exists")){
								$scope.showErrorRegister = true;	
							$scope.registerMessage = response.status;
						}else {
							$scope.showErrorRegister = false;
							window.location.replace("/opsmx-analysis/public/login.html");
						}
					$scope.registerData = response.status;
				}).error(function(response){
					$scope.registerData = response.status;
					
				});
				 }*/
			}
	
});

loginApp.directive('passwordConfirm', ['$parse', function ($parse) {
	 return {
	    restrict: 'A',
	    scope: {
	      matchTarget: '=',
	    },
	    require: 'ngModel',
	    link: function link(scope, elem, attrs, ctrl) {
	      var validator = function (value) {
	        ctrl.$setValidity('match', value === scope.matchTarget);
	        return value;
	      }
	 
	      ctrl.$parsers.unshift(validator);
	      ctrl.$formatters.push(validator);
	      
	      // This is to force validator when the original password gets changed
	      scope.$watch('matchTarget', function(newval, oldval) {
	        validator(ctrl.$viewValue);
	      });

	    }
	  };
	}]);

loginApp.config(['GooglePlusProvider', function(GooglePlusProvider) {
	GooglePlusProvider.setScopes('https://www.googleapis.com/auth/userinfo.email');
    GooglePlusProvider.init({
     clientId: '385066209750-r52j39f774995pta825hciauagm1irvl.apps.googleusercontent.com',
     apiKey:   '385066209750-r52j39f774995pta825hciauagm1irvl.apps.googleusercontent.com'
      
    });
}]);

