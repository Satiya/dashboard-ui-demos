'use strict';

var app = angular.module('monitoringApp', ['ui.router', 'ui.bootstrap','visualizationService','angularUtils.directives.dirPagination']);
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	app.value('baseUrl', "http://54.67.70.132:8161");
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/control-panel.html',
      data: { pageTitle: 'OpsMx' },
      controller: 'monitoringCtrl'
    }).state('organization', {
    url: '/organization',
    templateUrl: 'templates/project.html',
    data: { pageTitle: 'OpsMx' },
    controller: 'projectCtrl'
    }).state('applications', {
        url: '/applications',
        templateUrl: 'templates/applications.html',
        data: { pageTitle: 'OpsMx' },
        controller: 'applicationCtrl'
  }).state('pipelines', {
      url: '/:application/pipelines',
      templateUrl: 'templates/pipeline.html',
      data: { pageTitle: 'OpsMx' },
      controller: 'pipelineCtrl'
  }).state('policy', {
	    url: '/policy',
	    templateUrl: 'templates/sla.html',
	    controller: 'policyCtrl'
    	  
})
    
}]);


// dashboard controller starting

app.controller('monitoringCtrl', function($scope, $http, $location, $rootScope, $stateParams) {
  $('#navFix').affix({
    offset: {
      top: $('header').height()
    }
  });

  $scope.entityUser = function(userType) {
    $location.path("/entityUser/" + userType);
  }

});

// dashboard controller ending

app.controller('projectCtrl', function($scope, $filter, $http, $location, $rootScope, $stateParams, $modal) {


	  $scope.userType = $stateParams.userType;
	  $scope.uID = $stateParams.uID;
	 
	  
	  $http.get("data/spinnakerapp_projects.json").then(function(data) {
		    $scope.projectData = data.data;
		    $scope.applications = data.data.config;
		 //   $scope.healthList = data.data.healthFilterList;
		    
			angular.forEach($scope.projectData,function(projectList) {
				angular.forEach(projectList.config,function(applications) {
					$scope.applicationsCount =applications.length;
				})
			})
		  })
		  $scope.sort_by = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}
	});


//session controller starting

app.controller('applicationCtrl', function($scope, $http, $location, $rootScope, $stateParams, $filter, $timeout) {

	  $scope.pipelines = function(connectedApplication) {
		    $location.path("/pipelines/" +connectedApplication);
		  }
	  
/*	  $http.get("data/spinnakerappdemo_pipelines.json").then(function(data) {
		    $scope.pipelineDetails = data.data;
		    $scope.stages = [[]];
			angular.forEach( $scope.pipelineDetails,function(pipelinetList) {
				if(pipelinetList.stages.length > $scope.stages[0].length){
					$scope.stages = [];
					$scope.stages.push(pipelinetList.stages);
					
				}
				
			})
		    
		    
		  })*/
	  
	  $http.get("data/pipelines-3.json").then(function(data) {
		   // $scope.apppipelineDetails = data.data;
		    $scope.stages = [[]];
		    $scope.pipelineDetails = [];
		    var appName = [];
			angular.forEach(data.data,function(pipelinetList) {
				var appIndex = appName.indexOf(pipelinetList.application);
				if(appIndex !=-1){
					var pipeLines = $scope.pipelineDetails[appIndex];
					pipeLines.pipelineArray.push(pipelinetList);
				}else{
					var array = [];
					appName.push(pipelinetList.application);
					array.push(pipelinetList);
					$scope.pipelineDetails.push({application : pipelinetList.application,pipelineArray : array});
				}
				if(pipelinetList.stages.length > $scope.stages[0].length){
					$scope.stages = [];
					$scope.stages.push(pipelinetList.stages);
					
				}
				
			})
		  })
		  
		  
		  $scope.getAppPipelineDate = function(data){
		  var appPipeLInesDate = data.pipelineArray;
		  var date =0,bulildNumber=0;
		  angular.forEach(data.pipelineArray,function(pipeLine){
			  if(!angular.isUndefined(pipeLine.context.buildInfo)){
				  if(bulildNumber < pipeLine.context.buildInfo.number){
				  bulildNumber = pipeLine.context.buildInfo.number;
					  if(!angular.isUndefined(pipeLine.endTime)){
						  date = pipeLine.endTime;
					  }
				  }
			  }
			  
		  })
		  return date;
		  
	  }
		  
		  $scope.getAppPipelineScore = function(data){
		  var appPipeLInes = data.pipelineArray;
		  var score =0,bulildNumber=0;
		  angular.forEach(data.pipelineArray,function(pipeLine){
			  if(!angular.isUndefined(pipeLine.context.buildInfo)){
				  /*if(i ==1){
					  i++;
					  score = pipeLine.context.canary.canaryResult.overallScore;
					  console.log(pipeLine.name);
					  console.log(pipeLine.context.canary.canaryResult.overallScore);
				  }
				  else*/ if(bulildNumber < pipeLine.context.buildInfo.number){
				  bulildNumber = pipeLine.context.buildInfo.number;
					  if(!angular.isUndefined(pipeLine.context.canary)){
						  score = pipeLine.context.canary.canaryResult.overallScore;
					  }
				  }
			  }
			  
		  })
		  return score;
		  
	  }
	  
	  $scope.getAppPipelineScoreStatus = function(data){
		  var appPipeLInes = data.pipelineArray;
		  var score =0,bulildNumber=0;
		  var status = "SUCCEDED";
		  angular.forEach(data.pipelineArray,function(pipeLine){
			  if(!angular.isUndefined(pipeLine.context.buildInfo)){
				  if(!angular.isUndefined(pipeLine.context.buildInfo.number)){
					  if(bulildNumber < pipeLine.context.buildInfo.number){
						  bulildNumber = pipeLine.context.buildInfo.number;
						  status = pipeLine.status;
						  if(!angular.isUndefined(pipeLine.context.canary)){
							  score = pipeLine.context.canary.canaryResult.overallScore;
						  }
					  }
				  }
			  }
			  
		  })
		  return status;
		  
	  }
		  
//		  $scope.pipelines = [];
		  $scope.getuniqueLatestPipelineScore = function(pipeline,pipelines){
//			  $scope.pipelines.push(pipeline.name);
			  var score = 0;
			  var buileNumber = 0;
			  angular.forEach(pipelines.pipelineArray,function(data){
				  if(data.name === pipeline.name){
					  if(!angular.isUndefined(data.context.buildInfo)){
					  if(buileNumber <  data.context.buildInfo.number){
						  buileNumber = data.context.buildInfo.number;
							  if(!angular.isUndefined(data.context.canary)){
									  score = data.context.canary.canaryResult.overallScore;
						  }
					  }
					  }
				  }
			  })
			  return score;
		  }
		  
		  $scope.getuniqueLatestPipelineScoreStatus = function(pipeline,pipelines){
//			  $scope.pipelines.push(pipeline.name);
			  var status = "SUCCEDED";
			  var buileNumber = 0;
			  angular.forEach(pipelines.pipelineArray,function(data){
				  if(data.name === pipeline.name){
					  if(!angular.isUndefined(data.context.buildInfo)){
						  if(buileNumber <  data.context.buildInfo.number){
							  buileNumber = data.context.buildInfo.number;
								  if(!angular.isUndefined(data.context.canary)){
//										  score = data.context.canary.canaryResult.overallScore;
									  status = data.status;
							  }
						  }
					  }
					 
				  }
			  })
			  return status;
		  }
		  
		  
//		  if(score !=1){
//			  return score;
//		  }else{
//			  return null;
//		  }
		 
//	  }
		  
	  
	  
/*	$http.get("data/spinnakerapp_list.json").then(function(data) {
		    $scope.applications = data.data;
			angular.forEach($scope.projectData,function(projectList) {
				angular.forEach(projectList.config,function(applications) {
					$scope.applicationsCount =applications.length;
				})
			})
		  })*/
	  
		  $scope.sort_by = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}
	  
	  $scope.colourIncludes = [];
	    $scope.includeColour = function(groupColor) {
	    	$scope.version = false;
	        var i = $.inArray(groupColor, $scope.colourIncludes);
	        
	        if (i > -1) {
	            $scope.colourIncludes.splice(i, 1);
	        } else {
	            $scope.colourIncludes.push(groupColor);
	        }
	    }
	    
	    $scope.colourFilter = function(canaryData) {
	    	//$scope.failed = true;
	        if ($scope.colourIncludes.length > 0) {
	            if ($.inArray('SUCCEDED', $scope.colourIncludes) < 0)
	                return;
	        }
	        
	        return canaryData;
	    }
	    
	    var idx = null;
		  var i = 0;
		  $scope.getServiceMetrics = function(index, pipelineStages) {
			  
		    if (idx == index) {
		      $scope.displayHeatMap = !$scope.displayHeatMap;
		    }
		    idx = index;
		    i++;
		    $scope.idSelectedVote = '';
		    $scope.selectedPipeline = pipelineStages.stages;
		    $scope.selectedRowId = index;
		    	
		    $scope.setSelected = function(idSelectedVote) {
				$scope.idSelectedVote = idSelectedVote;
			}

		    $scope.groupName = pipelineStages.name;
		  
		  }
		  
		  
		  $scope.getDutarionByStartAndEndTime = function(startTime,endTime){
			  if(startTime == null || endTime == null){
				  return null;
			  }
			  return moment.utc(moment(endTime).diff(moment(startTime))).format("mm")+" m "+moment.utc(moment(endTime).diff(moment(startTime))).format("ss")+" s";
		  }
	  
	
});

app.filter('millSecondsToTimeString', function() {
	  return function(millseconds) {
	    var oneSecond = 1000;
	    var oneMinute = oneSecond * 60;
	    var oneHour = oneMinute * 60;
	    var oneDay = oneHour * 24;

	    var seconds = Math.floor((millseconds % oneMinute) / oneSecond);
	    var minutes = Math.floor((millseconds % oneHour) / oneMinute);
	    var hours = Math.floor((millseconds % oneDay) / oneHour);
	    var days = Math.floor(millseconds / oneDay);

	    var timeString = '';
	    if(millseconds == undefined || millseconds === ''){
	    	return timeString;
	    }
	    if (days !== 0) {
	        timeString += (days !== 1) ? (days + ' days ') : (days + ' day ');
	    }
	    if (hours !== 0) {
	        timeString += (hours !== 1) ? (hours + ' hours ') : (hours + ' hour ');
	    }
	    if (minutes !== 0) {
	        timeString += (minutes !== 1) ? (minutes + ' m ') : (minutes + ' m ');
	    }
	    if (seconds !== 0 || millseconds < 1000) {
	        timeString += (seconds !== 1) ? (seconds + ' s ') : (seconds + ' s ');
	    }

	    return timeString;
	};
	});

app.controller('pipelineCtrl', function($scope, $http, $location, $rootScope, $stateParams, $filter,$timeout) {

	$scope.search = {};
	$scope.showDetails = false;
	$scope.applicationName = $stateParams.application;
	
	 if ($scope.name != null || $scope.name != '') {
	    	$scope.search.name= $scope.applicationName;
	    }
	 
	 
	 $scope.stageFilterValues = 
				 ["Jenkins", "Bake in us-west-2 ", "Bake", "Deploy in us-west-2", "disableCluster", "shrinkCluster", "Deploy", "ACA Task", "Deploy Canary"];
	 
	
	$http.get("data/pipelines-3.json").then(function(data) {
		    $scope.pipelineDetails = data.data;
		    $scope.stages = [[]];
			angular.forEach( $scope.pipelineDetails,function(pipelinetList) {
				if(pipelinetList.stages.length > $scope.stages[0].length){
					$scope.stages = [];
					$scope.stages.push(pipelinetList.stages);
					
				}
				
			})
		    
		    
		  })
	  
		  $scope.sort_by = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}
	
	var idx = null;
	  var i = 0;
	  $scope.getServiceMetrics = function(index, pipelineStages) {
		  
	    if (idx == index) {
	      $scope.displayHeatMap = !$scope.displayHeatMap;
	    }
	    idx = index;
	    i++;
	    $scope.idSelectedVote = '';
	    $scope.selectedPipeline = pipelineStages.stages;
	    $scope.selectedRowId = index;
	    	
	    $scope.setSelected = function(idSelectedVote) {
			$scope.idSelectedVote = idSelectedVote;
		}

	    $scope.groupName = pipelineStages.name;
	  
	  }
	  
	  
	  $scope.getDutarionByStartAndEndTime = function(startTime,endTime){
		  if(startTime == null || endTime == null){
			  return null;
		  }
		  return moment.utc(moment(endTime).diff(moment(startTime))).format("mm")+" m "+moment.utc(moment(endTime).diff(moment(startTime))).format("ss")+" s";
	  }
	  
		$scope.getStagesData = function(data){
			$scope.showDetails = true;
			$scope.stageName = data.name;
			$scope.overallScore = data.name.context;
			$scope.stageStatus = data.status;
  			$scope.versionNames=[];
  		if(data.name == "Canary" || data.name == "ACA Task" || data.name == "ACA Stage"){
  			$scope.stageScore = data.context.canary.canaryResult.overallScore;
  			$scope.canaryId = data.context.canary.id;
  			
  		}
  			/*$scope.versions=data.stats;
  			 * 
  			 * stage.context.canary.canaryResult.overallScore}
  			 * 
			for(versionName in $scope.versions){
				$scope.versionNames.push(versionName);
			}
			$scope.version = true;
			$scope.metricData = data;*/
		}
		
		$scope.colourIncludes = [];
	    $scope.includeColour = function(groupColor) {
	    	$scope.version = false;
	        var i = $.inArray(groupColor, $scope.colourIncludes);
	        
	        if (i > -1) {
	            $scope.colourIncludes.splice(i, 1);
	        } else {
	            $scope.colourIncludes.push(groupColor);
	        }
	    }
	    
	    $scope.colourFilter = function(canaryData) {
	    	//$scope.failed = true;
	        if ($scope.colourIncludes.length > 0) {
	            if ($.inArray(canaryData.status, $scope.colourIncludes) < 0)
	                return;
	        }
	        
	        return canaryData;
	    }
	
});

//sla controller starting

app.filter('numberEx', ['numberFilter', '$locale',
  function(number, $locale) {

    var formats = $locale.NUMBER_FORMATS;
    return function(input, fractionSize) {
      // Get formatted value
      var formattedValue = number(input, fractionSize);

      // get the decimalSepPosition
      var decimalIdx = -1;
      if(formattedValue != undefined){
    	  decimalIdx = formattedValue.indexOf(formats.DECIMAL_SEP);
      }
      
      
      // If no decimal just return
      if (decimalIdx == -1) return formattedValue;

 
      var whole = formattedValue.substring(0, decimalIdx);
      var decimal = (Number(formattedValue.substring(decimalIdx)) || "").toString();
      
      return whole +  decimal.substring(1);
    };
  }
]);

app.controller('policyCtrl', function($scope, $http, $location, $rootScope, $stateParams, $filter) {

	$scope.showPolicy = false;
	
	$scope.getParentIdStages = function(data){
		if(data.name === 'Canary' || data.parentStageId === null){
			return data;
		}
//		if(data.parentStageId == null){
//			return data;
//		}
	}
	

	var input = $('#input-a');
	input.clockpicker({
	    autoclose: true
	});

	// Manual operations
	$('#button-a').click(function(e){
	    // Have to stop propagation here
	    e.stopPropagation();
	    input.clockpicker('show')
	            .clockpicker('toggleView', 'minutes');
	});
	$('#button-b').click(function(e){
	    // Have to stop propagation here
	    e.stopPropagation();
	    input.clockpicker('show')
	            .clockpicker('toggleView', 'hours');
	});
	
	$scope.IsVisible = false;
	$scope.showRemove = false;
	$scope.showRemoveAction = false;



	
	$http.get("data/pipelines-3.json").then(function(data) {
//		    $scope.pipelineDetails = data.data;
		    $scope.stages = [[]];
		    $scope.pipelineDetails = [];
		    var appName = [];
			angular.forEach(data.data,function(pipelinetList) {
				var appIndex = appName.indexOf(pipelinetList.application);
				if(appIndex !=-1){
					var pipeLines = $scope.pipelineDetails[appIndex];
					pipeLines.pipelineArray.push(pipelinetList);
				}else{
					var array = [];
					appName.push(pipelinetList.application);
					array.push(pipelinetList);
					$scope.pipelineDetails.push({application : pipelinetList.application,pipelineArray : array});
				}
				if(pipelinetList.stages.length > $scope.stages[0].length){
					$scope.stages = [];
					$scope.stages.push(pipelinetList.stages);
					
				}
				
			})
		  })



$scope.conditions = []
$scope.actions = []	
$scope.showCondition = false;
$scope.showScript = false;
$scope.hideCondition = true;
$scope.conditions.push({
	
});

$scope.actions.push({
	
});

/*$scope.actionTypes.push({
	statusType : 0,
	telephone : '',
	email : '',
	pipeline : '',
	stageName : ''
	
});
*/
$scope.addCondition = function() {
	$scope.showRemove = true;
	$scope.showCondition = true;
	$scope.hideCondition = false;

	$scope.conditions.push({
		
	});
	
	
	$scope.showRemove = true;
}

$scope.time = new Date();

$scope.addAction = function() {
	$scope.showRemoveAction = true;

	$scope.actions.push({
		
	});
	$scope.showRemoveAction = true;
}

$scope.remove = function() {
	var question = $scope.conditions.length - 1
	$scope.conditions.splice(question);
}

$scope.removeAction = function() {
	var question = $scope.actions.length - 1
	$scope.actions.splice(question);
}

$scope.removeAll = function() {
	$scope.showQuestion = true;
	$scope.showRemove = false;
	$scope.conditions = []
}

$scope.getScript = function(){
	$scope.showScript = true;
}

$scope.IsVisible = true;
$scope.showHide = function(){
	$scope.IsVisible = $scope.ShowUser;
}

// code for showing actionns

$scope.actionTypes = [
               		{
               			action : 'Notify user',
               			id : 0
               		},
               		{
               			action : 'Trigger pipeline',
               			id : 1
               		},
               		{
               			action : 'Modify parameters',
               			id : 2
               		},
               		{
               			action : 'Script',
               			id : 3
               		}
               		
               		
               	];

$scope.statusType = [
          		{
          			statusType : 'score',
          			id : 0
          		},
          		{
          			statusType : 'status',
          			id : 1
          		}
          		
          		
          	];


          	$scope.type = [
          		{
          			language : 'success',
          			id : 0
          		},
          		{
          			language : 'failure',
          			id : 1
          		}
          		
          		
          	];

          	$scope.compare = [
          		{
          			type : 'less than',
          			id : 0
          		},
          		{
          			type : 'equal to',
          			id : 1
          		},
          		{
          			type : 'greater than',
          			id : 2
          		}
          	];
          	
          	
         	$scope.types = [
         	          		{
         	          			type : 'AND',
         	          			id : 1
         	          		},
         	          		{
         	          			type : 'OR',
         	          			id : 2
         	          		}
         	          	];
         	$scope.hours = [];
         	$scope.minutes =[];
         	for(var i=0;i<60;i++){
         		if(i<24){
         			$scope.hours.push(i);
         		}
         		$scope.minutes.push(i);
         	}
         	
//         	$scope.hours = [.00,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
         //	$scope.minutes = [00,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59];



$scope.addSlaData = function(data) {
	$scope.modifiedActionArray  = [];
	angular.forEach($scope.actions,function(act){
		if(act.action === 'Modify parameters'){
			$scope.modifiedActionArray.push({action : act.action,stage : act.stage,parameter :act.parameter,time :act.hours +":"+act.minutes})
			
		}else{
			$scope.modifiedActionArray.push(act);
		}
	})
  var postData = {
    policy: data.policyname,
   application : data.selectedApplication.application,
    pipeline : data.selectedPipeline.name,
    stage : data.selectedStage.name,
    conditions : $scope.conditions,
    actions : $scope.modifiedActionArray
  }
  $http({
		method : "POST",
		url: "http://52.8.104.253:8161/opsmx-cas-services/resources/api/policy",
		data: postData,
		headers: {'content-type': 'application/json'}
	}).success(function(response){
		$scope.showPolicy = true;
		$scope.successMessage = response.message;
		$scope.action.minutes = '';
		$scope.action.hours = '';
		$scope.condition = {};
		$scope.action = {};
		$scope.policyname = '';
		$scope.selectedApplication = '';
		$scope.selectedPipeline = '';
		$scope.selectedStage = '';
	}).error(function(response){
		$scope.successMessage = "Error in saving policy";
	})  
  
	window.setTimeout(function() {
	    $(".alert").fadeTo(500, 0).slideUp(500, function(){
	        $(this).remove(); 
	    });
	}, 4000);
	
}

});

app.filter('unique', function() {
    return function(input, key) {
        var unique = {};
        var uniqueList = [];
        if(input === undefined){
        	return uniqueList;
        }
        for(var i = 0; i < input.length; i++){
            if(typeof unique[input[i][key]] == "undefined"){
                unique[input[i][key]] = "";
                uniqueList.push(input[i]);
            }
        }
        return uniqueList;
    };
});
