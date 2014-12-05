angular.module('MyApp.selectors', [
    'MyApp.data',
    'ui.select'
])
.directive('municipalitySelector', function(){
    return {
        restrict: 'E',
        templateUrl: "/templates/selector.html"
    }
})
.controller('MyApp.selector.controller', ['$log', '$scope', 'Data', function($log, $scope, Data){
    $log.debug('MyApp.selector: Initialized');

    // Bind data to data service
    $scope.$on('DataLoaded', function(){ $scope.municipalities = Data.mapData.features; });
    $scope.$on('NodeSelected', function(){ $scope.selected = Data.activeNode.data()[0]; });
    $scope.$on('NodeDeselected', function(){ $scope.selected = null; });

    // Select item
    $scope.selectItem = function(item, model){
        var node = document.getElementById(item.gm_code);
        Data.setActiveNode(node);
    };

}]);
