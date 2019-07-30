const ASSETS_PATH = "./assets/files/";
const CHEER_FILES_PATH = "./assets/files/cheers/";


function getXMLDoc(responseText){
	var parser = new DOMParser();
	let xmlDoc = parser.parseFromString(responseText, "text/xml");
	return xmlDoc;
}

function formatCheerFile(responseText) {
	let boldRegex = /\*(.*)\*/m;
	let italicsRegex = /\~(.*)\~/g;
	let tabRegex = /\t(.*)$/g;
	let emptyLineRegex = /^justice$/g;

	let lines = responseText.split("\n");

	var output = "";
	for (var i = 0; i < lines.length; i++){
		output+= lines[i].replace(boldRegex, "<strong>$1</strong>")
							.replace(italicsRegex, "<em>$1</em>")
							.replace(tabRegex, "<span style='margin-left:25%;'>$1</span>");
		output+="<br/>";
	}
	return output;
}


var app = angular.module("heavyFlow", []);

app.controller("heavyFlowCtrl", function($scope, $http){

	$scope.cheersArray = [];
	$scope.cheersMapping = {};
	$scope.displayCheerDetails = false;

	$scope.loadFiles = function(){

		$http.get("./config/config.xml")
				.then(function(response){
					$scope.parseCheers(response.data);
				});
	}
	$scope.loadFiles();

	$scope.parseCheers = function(payload){
		var xmlDoc = getXMLDoc(payload);
		var cheers = xmlDoc.getElementsByTagName("cheer");
		for (var i = 0; i < cheers.length; i++){
			let obj = $scope.createCheerObject(cheers[i]);
			// console.log(obj);
			$scope.setCheersArray(obj);
			// $scope.setCheersMapping(obj);
		}
	}

	/* Setters & Getters */
	$scope.setCheersArray = function(cheerObject){
		$scope.cheersArray.push(cheerObject);
		$scope.setCheersMapping(cheerObject);
	}

	$scope.setCheersMapping = function(cheerObject){
		id = cheerObject.ID;
		$scope.cheersMapping[id] = cheerObject;
	}

	$scope.setCheersDetails = function(cheerObject){
		console.log(cheerObject);
		$scope.cheerName = cheerObject.Name;
		$scope.cheerType = cheerObject.Type;

		if (cheerObject.Inspiration != null){
			$scope.hasInspiration = true;
			console.log($scope.hasInspiration );

			$scope.cheersInpsirationName = cheerObject.Inspiration;
			$scope.cheersInpsirationSource = cheerObject.Source;
		} else { 
			console.log("NOOOO INSPIRATION");
			$scope.hasInspiration = false;
		}
		$scope.getCheerFileContent(cheerObject.File)
				.then(function(response){
					document.getElementById("cheerDetails").innerHTML = formatCheerFile(response);
				});
	}

	$scope.getCheerFileContent = function(filename){
		let filePath = CHEER_FILES_PATH + filename;
		return $http.get(filePath)
			.then(function(response){
				return response.data;
			});
	}


	$scope.getCheerObject = function(cheerID){
		let cheerObject = null;
		if ($scope.cheersMapping.hasOwnProperty(cheerID)){
			cheerObject = $scope.cheersMapping[cheerID];

		}
		return cheerObject;
	}

	
	$scope.createCheerObject = function(xmlObj){
		var cheersName = xmlObj.getElementsByTagName("name")[0].innerHTML;
		var cheersFile = xmlObj.getElementsByTagName("file")[0].innerHTML;
		var cheersType = xmlObj.getElementsByTagName("cheertype")[0].innerHTML;
		var cheersID = cheersFile.replace(".txt", "");

		var cheersInpsirationName = null;
		var cheersInpsirationSource = null;

		if (xmlObj.getElementsByTagName("inspiration").length > 0){
			console.log(xmlObj.getElementsByTagName("inspiration"));

			let inspiration = xmlObj.getElementsByTagName("inspiration")[0];
			console.log(inspiration);
			cheersInpsirationName = inspiration.getElementsByTagName("name")[0].innerHTML;
			console.log(cheersInpsirationName);
			cheersInpsirationSource = inspiration.getElementsByTagName("source")[0].innerHTML;
			console.log(cheersInpsirationSource);
		}
		return { 	"ID": cheersID, 		
					"Name": cheersName, 
					"File" : cheersFile, 	
					"Type": cheersType,
					"Inspiration": cheersInpsirationName, 
					"Source": cheersInpsirationSource 
				};
	}
	

	$scope.toggleCheerDetails = function(event){
		let id = event.srcElement.id;
		if (id !== "backButton"){
			let cheerObject = $scope.getCheerObject(id);
			if (cheerObject){
				$scope.setCheersDetails(cheerObject);
				$scope.displayCheerDetails = !$scope.displayCheerDetails;
			} else {
				alert("Something went wrong! Cheer object = " + cheerObject);
			}
		} else { 
			$scope.displayCheerDetails = !$scope.displayCheerDetails;
			document.getElementById("searchValueInput").focus();
		}
	}

	/* FILTER AND SORT: Used to filter the table listing & sort it by a given value */
	$scope.cheersFilter = function(value){
		$scope.filterByObj = {};
		if ($scope.searchValue){
			$scope.filterByObj["$"] = $scope.searchValue.trim();
		}
		return $scope.filterByObj;
	}

	$scope.clearSearchValue = function(event){
		$scope.searchValue = null;
	}


	// The orderBy filter uses an array of column names; The negative sign indicates reverse. 
	$scope.sortValue = ["Name"];
	$scope.sortReverse = false;
	// This function determines which column to sort the data by. 
	// It also takes into consideration whether or not to sort it in reverse
	$scope.setSort = function(attributeName){
		$scope.sortReverse = ($scope.sortValue == attributeName && !$scope.sortReverse) ? true : false;
		$scope.sortValue = $scope.sortReverse ? ["-"+attributeName] : [attributeName];
		//console.log($scope.sortValue);
	}

});

/* Filter for Module */
	app.filter("presentableName", function(){
		return function(value){
			return value.replace("&amp;", "&");
		}
	});