angular.module('MyApp.data', [])
.factory('Data', ['$log', '$rootScope', '$http', function($log, $rootScope, $http){
    $log.debug('MyApp.Data: Initialized');
    var return_object = {};

    //    Load data from files
    //////////////////////////////
    return_object.municipalities = [];
    queue()
        .defer(d3.json, "data/cities-geometry.json")
        .defer(d3.tsv, "data/cities-data.txt", function(d) {
            // Filter out the empty row in the cities-data.txt
            if(d.GM_NAAM != "") {

                // Clean data from negative values!
                for (var property in d) {
                    if (d.hasOwnProperty(property)) {
                        if(d[property] < 0) d[property] = null;
                    }
                };

                // Generate extra data
                d.P_MAN = sigFigs((d.AANT_MAN/d.AANT_INW)*100, 4);
                d.P_VROUW = sigFigs((d.AANT_VROUW/d.AANT_INW)*100, 4);

                return_object.municipalities.push(d);
            }
        })
        .await(dataLoaded);
    function dataLoaded(errors, mapData){
        return_object.mapData = mapData;
        $rootScope.$broadcast('DataLoaded');
    }

    //        Active Node
    //////////////////////////////
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

    //        City Data
    //////////////////////////////
    return_object.cityData = d3.map();
    return_object.mapColor = 'white';
    return_object.scopes = [
    // POPULATIE
    {
        title: 'Totaal',
        category: 'Populatie',
        datafield: 'AANT_INW',
        color: 'green'
    },{
        title: 'Per vierkante kilometer',
        category: 'Populatie',
        datafield: 'BEV_DICHTH',
        color: 'aquamarine'
    // },{
    //     title: 'Adressen per vierkante kilometer',
    //     category: 'Populatie',
    //     datafield: 'OAD',
    //     color: 'lightgreen'
    },{
        title: 'Percentage man',
        category: 'Populatie',
        datafield: 'P_MAN',
        color: 'darkgreen'
    },
    // AUTOS
    {
        title: 'Totaal',
        category: "Auto's",
        datafield: 'AUTO_TOT',
        color: 'red'
    },{
        title: 'Per huishouden',
        category: "Auto's",
        datafield: 'AUTO_HH',
        color: 'orange'
    },{
        title: 'Per vierkante kilometer',
        category: "Auto's",
        datafield: 'AUTO_LAND',
        color: 'darkred'
    },
    // Leeftijd
    {
        title: 'Percentage 65+',
        category: 'Leeftijd',
        datafield: 'P_65_EO_JR',
        color: 'blue'
    }];

    return_object.setScope = function(scope){
        // Set selected scope
        return_object.selectedScope = scope;

        // Clear city data
        return_object.cityData = d3.map();

        // SET DATA
        return_object.municipalities.forEach(function(d){
            return_object.cityData.set(d.Code, +d[scope.datafield]);
        });
        // Set color
        return_object.mapColor = scope.color;

        $log.debug('MyApp.Data: Scope changed', scope.category, scope.title);
        $rootScope.$broadcast('ScopeChanged');
    }

    return return_object
}]);
