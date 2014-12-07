angular.module('MyApp.legend', [
    'MyApp.data'
])
.directive('mapLegend', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/legend.html',
        controller: 'MyApp.legend.LegendController'
    }
})
.controller('MyApp.legend.LegendController', ['$log', '$scope', 'Data', function($log, $scope, Data){
    $log.debug('MyApp.legend.LegendController: Initialized');

    $scope.numberOfSteps = 8;
    var linearColorScale = d3.scale.linear();
    var stepValue = 0;
    var item = {};

    RenderLegend();
    $scope.$on('ScopeChanged', RenderLegend);
    $scope.$watch('numberOfSteps', RenderLegend);

    function RenderLegend(){
        if(Data.cityData.size() > 0){
            // Get selected scope
            $scope.selectedScope = Data.selectedScope;

            // Define color
            var maxValue = d3.max(Data.cityData.values());
            var minValue = d3.min(Data.cityData.values());
            if (minValue < 0) { minValue = 0; }
                linearColorScale.domain([minValue, maxValue])
                .range(["white", Data.mapColor]);

            // Refill legend items
            $scope.legendItems = [];
            for (i = 0; i < $scope.numberOfSteps; i++) {
                stepValue = (maxValue - minValue) * i / ($scope.numberOfSteps - 1) + minValue;
                stepValue = sigFigs(stepValue, 2);
                if(isNaN(stepValue)) stepValue = 0;
                item = {
                    label: stepValue,
                    color: linearColorScale(stepValue)
                };
                $scope.legendItems.push(item);
            }
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }
    }

    // http://blog.magnetiq.com/post/497605344/rounding-to-a-certain-significant-figures-in
    function sigFigs(n, sig) {
        var mult = Math.pow(10,
            sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    }

}]);
