angular.module('MyApp.topfive', [
    'MyApp.data'
])
.directive('topfive', [function(){
    return {
        restrict: 'E',
        template: '<svg id="topfive"></svg>',
        controller: 'MyApp.topfive.controller'
    }
}])
.controller('MyApp.topfive.controller', ['$log', '$scope', 'Data', function($log, $scope, Data) {
    $log.debug('MyApp.topfive.controller: Initialized');

    var margin = {top: 10, right: 20, bottom: 80, left: 60};
    var width = document.getElementById("topfive").offsetWidth - margin.left - margin.right;
    var height = document.getElementById("topfive").offsetHeight - margin.top - margin.bottom;

    var svg = d3.select("#topfive")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
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

    $scope.topfive = [];

    $scope.$on('ScopeChanged', RenderTopfive);
    function RenderTopfive() {
        $scope.topfive = [];
        var cities = [];

        // Set city data in temporary array for sorting
        for (var gm in Data.cityData._) {
            cities.push( { 'gm': gm, 'value': Data.cityData._[gm] } );
        }
        cities.sort(function (a, b) {
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
            return 0;
        });

        // Get the top five municipalties for this data
        for (var i = 0; i < 5; i++) {
            var municipality;

            for (var j in Data.municipalities) {
                if (Data.municipalities[j].Code == cities[i].gm) {
                    municipality = Data.municipalities[j];
                    break;
                }
            }

            var city = {
                'gm': cities[i].gm,
                'municipality': municipality,
                'value': cities[i].value
            };
            $scope.topfive.push(city);
        }

        // Clear old bar chart
        svg.selectAll("*").remove();

        // Compute domain
        x.domain($scope.topfive.map(function(d) { return d.municipality.GM_NAAM; }));
        y.domain([0, d3.max($scope.topfive, function(d) { return d.value; })]);

        // Coloring
        var linearColorScale = d3.scale.linear()
            .domain([cities[cities.length - 1].value, $scope.topfive[0].value])
            .range(["white", Data.selectedScope.color]);

        // Render x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(10," + height + ")")
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
            .data($scope.topfive)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.municipality.GM_NAAM); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .style("fill", function(d) {
                    return linearColorScale(d.value)
                });

        // Render text in bar
        svg.selectAll(".text")
            .data($scope.topfive)
            .enter().append("text")
                .attr("class", "text")
                .attr("x", function(d) { return x(d.municipality.GM_NAAM); })
                .attr("dx", x.rangeBand() / 2)
                .attr("y", function(d) { return y(d.value); })
                .attr("dy", "15px")
                .attr("text-anchor", "middle")
                .style("fill", Data.selectedScope.textColor)
                .text(function(d) { return d.value; });
    }
}])
