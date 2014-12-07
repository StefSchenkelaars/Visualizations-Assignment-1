angular.module('MyApp.origin', [
    'MyApp.data'
])
.directive('origin', [function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/origin.html',
        controller: 'MyApp.origin.controller'
    }
}])
.controller('MyApp.origin.controller', ['$log', '$scope', 'Data', function($log, $scope, Data) {
    $log.debug('MyApp.origin.controller: Initialized');

    var margin = {top: 10, right: 20, bottom: 80, left: 60};
    var width = document.getElementById("origin").offsetWidth - margin.left - margin.right;
    var height = document.getElementById("origin").offsetHeight - margin.top - margin.bottom;

    var rootSvg = d3.select("#origin")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var svg = rootSvg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .2);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]) //, "#ff8c00"]);
        .domain([0, 1, 2, 3, 4, 5]);

    var originString = function(i) {
        var o = [
            'Westers',
            'Marrokaans',
            'Antilliaans',
            'Surinaams',
            'Turkije',
            'Overig'
        ];
        return o[i];
    }

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5, "%");

    $scope.results = [];

    $scope.$on('ScopeChanged', RenderOrigin);
    $scope.$on('NodeSelected', RenderOrigin);
    $scope.$on('NodeDeselected', RenderOrigin);

    function RenderOrigin() {
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
        $scope.results.forEach(function (d) {
            var y0 = 0;
            d.values = color.domain().map(function (i) {
                return {
                    i: i,
                    y0: y0,
                    y1: y0 += +d.origin[i]
                };
            });
            d.total = d.values[d.values.length - 1].y1;
        });
        x.domain($scope.results.map(function(d) { return d.municipality.GM_NAAM; }));
        y.domain([0, d3.max($scope.results, function(d) { return d.total; })]);

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
        var bars = svg.selectAll(".bar")
            .data($scope.results)
            .enter().append("g")
                .attr("class", "bar")
                // .attr("x", function(d) { return x(d.municipality.GM_NAAM); })
                // .attr("width", x.rangeBand())
                // .attr("y", function(d) { return y(d.total); })
                // .attr("height", function(d) { return height - y(d.total); })
                // .style("fill", function(d) {
                //     return color(0);
                // })
                .attr("transform", function (d) {
                    return "translate(" + x(d.municipality.GM_NAAM) + ",0)";
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

        // Fill bars
        bars.selectAll("rect")
            .data(function (d) {
                return d.values;
            })
            .enter().append("rect")
                .attr("width", x.rangeBand())
                .attr("y", function (d) {
                    return y(d.y1);
                })
                .attr("height", function (d) {
                    return y(d.y0) - y(d.y1);
                })
                .style("fill", function (d) {
                    return color(d.i);
                });

        // Display a legend
        var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return originString(d);
            });
    }

    function getCity(cities, i, current) {
        for (var j in Data.municipalities) {
            if (Data.municipalities[j].Code == cities[i].gm) {
                return {
                    'gm': cities[i].gm,
                    'municipality': Data.municipalities[j],
                    'origin': [
                        +Data.municipalities[j].P_WEST_AL / 100.0,
                        +Data.municipalities[j].P_MAROKKO / 100.0,
                        +Data.municipalities[j].P_ANT_ARU / 100.0,
                        +Data.municipalities[j].P_SURINAM / 100.0,
                        +Data.municipalities[j].P_TURKIJE / 100.0,
                        +Data.municipalities[j].P_OVER_NW / 100.0
                    ],
                    'current': current
                };
            }
        }

        return null;
    }
}])
