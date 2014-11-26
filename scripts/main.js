var width = 800,
height = 800;

var cityData = d3.map();

var linearColorScale = d3.scale.linear()
.domain([0.0, 100.0])
.range(["white", "red"]);

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

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

queue()
.defer(d3.json, "data/cities-geometry.json")
.defer(d3.tsv, "data/cities-data.txt", function(d) { cityData.set(d.Code, +d.AUTO_TOT); })
.await(dataLoaded);

function dataLoaded(error, mapData) {
  var maxValue = d3.max(cityData.values());
  console.log("The maximum value is " + maxValue);
  linearColorScale.domain([0.0, maxValue]);
  g.selectAll("path")
  .data(mapData.features).enter()
  .append("path")
  .attr("d", path)
  .style("fill", function(d) { return linearColorScale(cityData.get(d.gm_code)); })
  .append("title").text(function(d) {return d.gm_naam + ", " +
  cityData.get(d.gm_code); });
}
