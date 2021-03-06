angular.module('MyApp.results', [
    'MyApp.data'
])
.directive('results', [function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/results.html',
        controller: 'MyApp.results.controller'
    }
}])
.controller('MyApp.results.controller', ['$log', '$scope', 'Data', function($log, $scope, Data) {
    $log.debug('MyApp.results.controller: Initialized');

    var margin = {top: 10, right: 20, bottom: 80, left: 60};
    var width = document.getElementById("results").offsetWidth - margin.left - margin.right;
    var height = document.getElementById("results").offsetHeight - margin.top - margin.bottom;

    var rootSvg = d3.select("#results")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var svg = rootSvg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .2);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    $scope.results = [];

    $scope.$on('ScopeChanged', RenderResults);
    $scope.$on('NodeSelected', RenderResults);
    $scope.$on('NodeDeselected', RenderResults);

    function RenderResults() {
        $scope.results = [];
        var cities = [];

        // Set city data in temporary array for sorting
        for (var gm in Data.cityData._) {
            if (Data.cityData._[gm] > 0) cities.push( { 'gm': gm, 'value': Data.cityData._[gm] } );
        }
        cities.sort(function (a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        // Get current city index if some city is selected
        var i = null;
        if (Data.activeNode.data()[0] !== undefined) {
            var gm = Data.activeNode.data()[0].gm_code;
            for (var i = 0; i < cities.length; i++) {
                if (cities[i].gm == gm) break;
            }
        }

        // Get interesting cities
        if (i >= 2 && i <= cities.length - 3) {
            for (var j = 0; j < 2; j++) {
                $scope.results.push( getCity(cities, j, j == i) );
            }
            for (var j = i - 1; j < i + 2; j++) {
                $scope.results.push( getCity(cities, j, j == i) );
            }
            for (var j = cities.length - 2; j < cities.length; j++) {
                $scope.results.push( getCity(cities, j, j == i) );
            }
        } else {
            for (var j = 0; j < 3; j++) {
                $scope.results.push( getCity(cities, j, j == i) );
            }
            for (var j = cities.length - 3; j < cities.length; j++) {
                $scope.results.push( getCity(cities, j, j == i) );
            }
        }

        // Clear old bar chart
        svg.selectAll("*").remove();

        // Compute domain
        x.domain($scope.results.map(function(d) { return d.municipality.GM_NAAM; }));
        y.domain([0, d3.max($scope.results, function(d) { return d.value; })]);

        // Set 'jump' lines
        rootSvg.selectAll("line").style('visibility', 'hidden');
        if (i >= 2 && i <= cities.length - 3) {
            if (i > 3) {
                var posX = x($scope.results[2].municipality.GM_NAAM) + 55;
                rootSvg.select("line.left")
                    .style('visibility', 'visible')
                    .attr('x1', posX)
                    .attr('x2', posX);
            }
            if (i < cities.length - 4) {
                var posX = x($scope.results[$scope.results.length - 2].municipality.GM_NAAM) + 54;
                rootSvg.select("line.right")
                    .style('visibility', 'visible')
                    .attr('x1', posX)
                    .attr('x2', posX);
            }
        } else {
            var posX = x($scope.results[3].municipality.GM_NAAM) + 55;
            rootSvg.select("line.left")
                .style('visibility', 'visible')
                .attr('x1', posX)
                .attr('x2', posX);
        }

        // Coloring
        var linearColorScale = d3.scale.linear()
            .domain([$scope.results[$scope.results.length - 1].value, $scope.results[0].value])
            .range(["white", Data.selectedScope.color]);

        // Render x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", function(d) {
                    return "rotate(-30)"
                });

        // Render y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Render bars
        svg.selectAll(".bar")
            .data($scope.results)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.municipality.GM_NAAM); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .style("fill", function(d) {
                    return linearColorScale(d.value)
                })
                .style("filter", function(d) {
                    if (d.current) return 'url(#dropshadow)';
                })
                .on("click", function(d) {
                    if (Data.activeNode.data()[0] !== undefined && Data.activeNode.data()[0].gm_code == d.gm) {
                        Data.setActiveNode(null);
                    } else {
                        var node = document.getElementById(d.gm);
                        Data.setActiveNode(node);
                    }
                });

        // Render text in bar
        svg.selectAll(".text")
            .data($scope.results)
            .enter().append("text")
                .attr("class", "text")
                .attr("x", function(d) { return x(d.municipality.GM_NAAM); })
                .attr("dx", x.rangeBand() / 2)
                .attr("y", function(d) {
                    if (y(d.value) > height - 22) return y(d.value) - 22;
                    return y(d.value);
                })
                .attr("dy", "15px")
                .attr("text-anchor", "middle")
                .style("fill", function(d) {
                    if (y(d.value) > height - 22) return 'black';
                    return getContrastYIQ( linearColorScale(d.value) );
                })
                .text(function(d) { return d.value; })
                .on("click", function(d) {
                    if (Data.activeNode.data()[0] !== undefined && Data.activeNode.data()[0].gm_code == d.gm) {
                        Data.setActiveNode(null);
                    } else {
                        var node = document.getElementById(d.gm);
                        Data.setActiveNode(node);
                    }
                });
    }

    function getCity(cities, i, current) {
        for (var j in Data.municipalities) {
            if (Data.municipalities[j].Code == cities[i].gm) {
                return city = {
                    'gm': cities[i].gm,
                    'municipality': Data.municipalities[j],
                    'value': cities[i].value,
                    'current': current
                };
            }
        }

        return null;
    }

    // http://24ways.org/2010/calculating-color-contrast/
    function getContrastYIQ(hexcolor) {
        var r = parseInt(hexcolor.substr(1,2),16);
        var g = parseInt(hexcolor.substr(3,2),16);
        var b = parseInt(hexcolor.substr(5,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }
}])
