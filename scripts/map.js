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
    var scale = height*900/50; // Make the map full height for the browser
    var xOffsetMap = 75; // Move the map horizontal (for the legend)
    var projection = d3.geo.albers()
        .rotate([0, 0])
        .center([5.6, 52.1])
        .parallels([50, 53])
        .scale(scale)
        .translate([width/2 + xOffsetMap,height/2 + 10]); // Place nice in screen

    var path = d3.geo.path().projection(projection);

    // Add tooltip to DOM
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip top")
      .style("opacity", 0)
      .style("top", 0);
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
                    if (typeof(Data.cityData.get(d.gm_code)) === 'undefined'){
                        tooltipInner.html(d.gm_naam);
                    } else {
                        tooltipInner.html(d.gm_naam + ", " + Data.cityData.get(d.gm_code));
                    }

                    var b = path.bounds(d);
                    x = (b[1][0] + b[0][0]) / 2.0 - parseInt(tooltip.style('width')) / 2.0 - 15;
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


    //         COLORING
    //////////////////////////////
    var linearColorScale = d3.scale.linear();
    $scope.$on('ScopeChanged', function(){
        // Set color
        var maxValue = d3.max(Data.cityData.values());
        var minValue = d3.min(Data.cityData.values());
        if (minValue < 0) { minValue = 0; }
        linearColorScale.domain([minValue, maxValue])
            .range(["white", Data.mapColor]);

        // Apply color to map
        g.selectAll("path")
            .style("fill", function(d){
                return linearColorScale(Data.cityData.get(d.gm_code))
            });
    })


    //         ZOOMING
    //////////////////////////////
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
    function zoomed() {
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // Zoom in on the clicked municipality
    $scope.$on('NodeSelected', function(event){
        // Hide the tooltip
        tooltip.style("opacity", 0);
        var zoomScale = .7;
        var municipality = Data.activeNode.data()[0];

        var bounds = path.bounds(municipality),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = zoomScale / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x + xOffsetMap, height / 2 - scale * y];

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
