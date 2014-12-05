angular.module('MyApp.data', [])
.factory('Data', ['$log', '$rootScope', '$http', function($log, $rootScope, $http){
    $log.debug('MyApp.Data: Initialized');

    var return_object = {};

    // return_object.municipalities = [];
    // return_object.cityData = d3.map();

    // Load data from files
    queue()
        .defer(d3.json, "data/cities-geometry.json")
        //   .defer(d3.tsv, "data/cities-data.txt", function(d) {
        //     // Filter out the empty row in the cities-data.txt
        //     if(d.GM_NAAM != "") return_object.municipalities.push(d);
        //   })
        .await(dataLoaded);

    function dataLoaded(errors, mapData){
        return_object.mapData = mapData;
        $rootScope.$broadcast('DataLoaded');
    }

    // This is where the active node is stored
    return_object.activeNode = d3.select(null);
    return_object.setActiveNode = function(node){
        // Remove active class from old node
        return_object.activeNode.classed("active", false);
        // Set new active node
        return_object.activeNode = d3.select(node);
        // Set active class on new node
        return_object.activeNode.classed("active", false);

        if (node == null) {
            $log.debug('MyApp.Data: Active node NULL');
            $rootScope.$broadcast('NodeDeselected');
        }else{
            $log.debug('MyApp.Data: Active node', return_object.activeNode.data()[0].gm_naam);
            $rootScope.$broadcast('NodeSelected');
        }
    }

    return return_object
}]);
