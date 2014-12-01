angular.module('MyApp.map', []);

angular.module('MyApp.map')
.controller('MapController', ['$log', '$rootScope', function($log, $rootScope){
  $log.debug('MyApp.map.MapController: Initialized');

  var active = d3.select(null);
  var width = document.getElementById("map").parentElement.offsetWidth;
  var height = document.getElementById("map").parentElement.offsetHeight;

  $rootScope.data = {};

  var cityData = d3.map();

  var zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(1)
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

  var linearColorScale = d3.scale.linear()
      .domain([0.0, 100.0])
      .range(["white", "red"]);

  var svg = d3.select("#map");

  // Setup the map projection for a good depiction of The Netherlands. The
  // projection is centered on the geographical center of the country, which
  // happens to be the city of Lunteren.
  var projection = d3.geo.albers()
      .rotate([0, 0])
      .center([5.6, 52.1])
      .parallels([50, 53])
      .scale(15000)
      .translate([width/2,height/2]);

  var path = d3.geo.path().projection(projection);

  var g = svg.append("g");

  // Add tooltip to DOM
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip top")
      .style("opacity", 0);
  tooltip.append("div")
      .attr("class", "tooltip-arrow");
  var tooltipInner = tooltip.append("div")
      .attr("class", "tooltip-inner");

  // Load city data
  queue()
      .defer(d3.json, "data/cities-geometry.json")
      .defer(d3.tsv, "data/cities-data.txt", function(d) {
        // Filter out the empty row in the cities-data.txt
        if(d.GM_NAAM != "") $rootScope.data[d.Code] = d;
        cityData.set(d.Code, +d.AUTO_TOT);
      })
      .await(dataLoaded);

  function dataLoaded(error, mapData) {
    var maxValue = d3.max(cityData.values());
    linearColorScale.domain([0.0, maxValue]);

    g.selectAll("path")
        .data(mapData.features).enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) { return linearColorScale(cityData.get(d.gm_code)); })
        .on("click", clicked)
        .on("mouseover", function(d) {
            tooltipInner.html(d.gm_naam + ", " + cityData.get(d.gm_code));
            tooltip.style("opacity", .9)
                .style("left", (d3.event.pageX - parseInt(tooltip.style('width'))/2) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
        })
    ;
  }

  function clicked(municipality) {
    // Broadcast the clicked Municipality
    $rootScope.$broadcast('MunicipalitySelected', municipality, this);
    tooltip.style("opacity", 0);
  }

  // Zoom in on the clicked municipality
  $rootScope.$on('MunicipalitySelected', function(event, municipality, element){

    if (active.node() === element) return reset();
    active.classed("active", false);
    active = d3.select(element).classed("active", true);

    var bounds = path.bounds(municipality),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .6 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(750)
        .call(zoom.translate(translate).scale(scale).event);
  });


  function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        .call(zoom.translate([0, 0]).scale(1).event);
  }

  function zoomed() {
    // g.style("stroke-width", 1.5 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }


}]);
