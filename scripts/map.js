angular.module('MyApp.map', [
    'MyApp.data'
])
.directive('dutchMap', ['$log', function($log){
    return {
        restrict: 'E',
        replace: true,
        template: '<svg id="map"></svg>',
        controller: 'MyApp.map.DutchMapController'
    }
}])
.controller('MyApp.map.DutchMapController', ['$log', '$scope', 'Data', function($log, $scope, Data){
    $log.debug('MyApp.map.MapController: Initialized');

    var width = document.getElementById("map").parentElement.offsetWidth;
    var height = document.getElementById("map").parentElement.offsetHeight;

    var svg = d3.select("#map");
    var g = svg.append("g");

    // Setup the map projection for a good depiction of The Netherlands. The
    // projection is centered on the geographical center of the country, which
    // happens to be the city of Lunteren.
    // Make the map full height for the browser
    var scale = height*900/50;
    var projection = d3.geo.albers()
        .rotate([0, 0])
        .center([5.6, 52.1])
        .parallels([50, 53])
        .scale(scale)
        .translate([width/2,height/2 + 10]);

    var path = d3.geo.path().projection(projection);

    // Add tooltip to DOM
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip top")
      .style("opacity", 0);
    tooltip.append("div")
      .attr("class", "tooltip-arrow");
    var tooltipInner = tooltip.append("div")
      .attr("class", "tooltip-inner");

    $scope.$on('DataLoaded', function(){

        // This is where the map is drawn, the click events are registered
        // and the tooltip is rendered.
        g.selectAll("path")
            .data(Data.mapData.features).enter()
            .append("path")
            .attr("id", function(d) { return d.gm_code }) // Set the gm_code as the id on the element
            .attr("d", path)
            .on("click", function(d){
                if (Data.activeNode.node() === this){
                    Data.setActiveNode(null);
                }else{
                    Data.setActiveNode(this);
                }
            })
            .on("mouseover", function(d) {
                if(Data.activeNode.node() === null) {
                    // tooltipInner.html(d.gm_naam + ", " + Data.cityData.get(d.gm_code));
                    tooltipInner.html(d.gm_naam);

                    var b = path.bounds(d);
                    x = (b[1][0] + b[0][0]) / 2.0 - parseInt(tooltip.style('width')) / 2.0;
                    y = b[0][1] - parseInt(tooltip.style('height'));

                    tooltip.style("opacity", .9)
                        .style("left", x + "px")
                        .style("top", y + "px");
                }
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0);
            });
    });

    //         ZOOMING
    //////////////////////////////
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
    function zoomed() {
        // g.style("stroke-width", 1.5 / d3.event.scale + "px");
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // Zoom in on the clicked municipality
    $scope.$on('NodeSelected', function(event){
        // Hide the tooltip
        tooltip.style("opacity", 0);

        var municipality = Data.activeNode.data()[0];

        var bounds = path.bounds(municipality),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .7 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        // Transition for the zooming
        svg.transition()
            .duration(750)
            .call(zoom.translate(translate).scale(scale).event);
    });

    $scope.$on('NodeDeselected', function(event){
        svg.transition()
            .duration(750)
            .call(zoom.translate([0, 0]).scale(1).event);
    });


}]);




//
//
//
// angular.module('MyApp.map')
// .controller('MapController', ['$log', '$rootScope', 'Data', function($log, $rootScope, Data){
//   $log.debug('MyApp.map.MapController: Initialized');
//
//   var width = document.getElementById("map").parentElement.offsetWidth;
//   var height = document.getElementById("map").parentElement.offsetHeight;
//
//   var active = d3.select(null);
//   var svg = d3.select("#map");
//   var g = svg.append("g");
//
//   $rootScope.municipalities = [];
//
//   var cityData = d3.map();
//
//   var zoom = d3.behavior.zoom()
//       .translate([0, 0])
//       .scale(1)
//       .scaleExtent([1, 8])
//       .on("zoom", zoomed);
//
//   var linearColorScale = d3.scale.linear()
//       .domain([0.0, 100.0])
//       .range(["white", "red"]);
//
//   // Setup the map projection for a good depiction of The Netherlands. The
//   // projection is centered on the geographical center of the country, which
//   // happens to be the city of Lunteren.
//   var projection = d3.geo.albers()
//       .rotate([0, 0])
//       .center([5.6, 52.1])
//       .parallels([50, 53])
//       .scale(15000)
//       .translate([width/2,height/2]);
//
//   var path = d3.geo.path().projection(projection);
//
//   // Add tooltip to DOM
//   var tooltip = d3.select("body").append("div")
//       .attr("class", "tooltip top")
//       .style("opacity", 0);
//   tooltip.append("div")
//       .attr("class", "tooltip-arrow");
//   var tooltipInner = tooltip.append("div")
//       .attr("class", "tooltip-inner");
//
//   // Load city data
//   queue()
//       .defer(d3.json, "data/cities-geometry.json")
//       .defer(d3.tsv, "data/cities-data.txt", function(d) {
//         // Filter out the empty row in the cities-data.txt
//         if(d.GM_NAAM != "") $rootScope.municipalities.push(d);
//         cityData.set(d.Code, +d.AUTO_TOT);
//       })
//       .await(dataLoaded);
//
//   function dataLoaded(error, mapData) {
//     var maxValue = d3.max(cityData.values());
//     linearColorScale.domain([0.0, maxValue]);
//
//     console.log("Mapdata:", mapData);
//
//
//     g.selectAll("path")
//         .data(mapData.features).enter()
//         .append("path")
//         .attr("id", function(d) { return d.gm_code }) // Set the gm_code as the id on the element
//         .attr("d", path)
//         .style("fill", function(d) { return linearColorScale(cityData.get(d.gm_code)); })
//         .on("click", clicked)
//         .on("mouseover", function(d) {
//             if(active.node() === null) {
//                 tooltipInner.html(d.gm_naam + ", " + cityData.get(d.gm_code));
//
//                 var b = path.bounds(d);
//                 x = (b[1][0] + b[0][0]) / 2.0 - parseInt(tooltip.style('width')) / 2.0;
//                 y = b[0][1] - parseInt(tooltip.style('height'));
//
//                 tooltip.style("opacity", .9)
//                     .style("left", x + "px")
//                     .style("top", y + "px");
//             }
//         })
//         .on("mouseout", function(d) {
//             tooltip.style("opacity", 0);
//         })
//     ;
//   }
//
//   function clicked(municipality) {
//      if (active.node() === this) return reset();
//
//     // Broadcast the clicked Municipality
//     $rootScope.$broadcast('MunicipalitySelected', municipality);
//
//   }
//
//   // Zoom in on the clicked municipality
//   $rootScope.$on('MunicipalitySelected', function(event, municipality){
//     // Hide the tooltip
//     tooltip.style("opacity", 0);
//
//     // Find the element by id
//     element = document.getElementById(municipality.gm_code);
//
//     // Select the selected node
//     if (active.node() === element) return reset();
//     active.classed("active", false);
//     active = d3.select(element).classed("active", true);
//
//     // Zoom in on the element
//     var bounds = path.bounds(municipality),
//         dx = bounds[1][0] - bounds[0][0],
//         dy = bounds[1][1] - bounds[0][1],
//         x = (bounds[0][0] + bounds[1][0]) / 2,
//         y = (bounds[0][1] + bounds[1][1]) / 2,
//         scale = .7 / Math.max(dx / width, dy / height),
//         translate = [width / 2 - scale * x, height / 2 - scale * y];
//
//     // Transition for the zooming
//     svg.transition()
//         .duration(750)
//         .call(zoom.translate(translate).scale(scale).event);
//   });
//
//
//   function reset() {
//     // TODO set $scope.selectedMunicipality to undefined
//     $rootScope.$broadcast('MunicipalityDeselected');
//
//     // Remove selected
//     active.classed("active", false);
//     active = d3.select(null);
//
//     // Zoom out
//     svg.transition()
//         .duration(750)
//         .call(zoom.translate([0, 0]).scale(1).event);
//   }
//
//   function zoomed() {
//     // g.style("stroke-width", 1.5 / d3.event.scale + "px");
//     g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//   }
//
//
// }]);
