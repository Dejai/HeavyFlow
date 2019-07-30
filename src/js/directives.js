

app.directive("searchBar", function(){
	return {
		restrict: "A",
		templateUrl: "./src/views/searchBar.html"
	}
});

app.directive("cheersTable", function(){
	return { 
		restrict: "A",
		templateUrl: "./src/views/cheersTable.html"
	}
});

app.directive("cheerDetails", function(){
	return { 
		restrict: "A",
		templateUrl: "./src/views/cheerDetails.html"
	}
});

