angular.module('MyApp.selectors', [
    'MyApp.data',
    'ui.select'
])
.directive('municipalitySelector', function(){
    return {
        restrict: 'E',
        templateUrl: "templates/municipality-selector.html"
    }
})
.controller('MyApp.selectors.MunicipalitySelectorCtrl', ['$log', '$scope', 'Data', function($log, $scope, Data){
    $log.debug('MyApp.selectors.MunicipalitySelectorCtrl: Initialized');

    // Load data if data is already loaded or on broadcast
    if(Data.mapData !== undefined) loadData();
    $scope.$on('DataLoaded', loadData);
    function loadData(){ $scope.municipalities = Data.mapData.features; }

    // Bind data to data service
    $scope.$on('NodeSelected', function(){ $scope.selected = Data.activeNode.data()[0]; });
    $scope.$on('NodeDeselected', function(){ $scope.selected = null; });

    // Select item
    $scope.selectItem = function(item, model){
        var node = document.getElementById(item.gm_code);
        Data.setActiveNode(node);
    };

}])
.directive('scopeSelector', function(){
    return {
        restrict: 'E',
        templateUrl: "templates/scope-selector.html"
    }
})
.controller('MyApp.selectors.ScopeSelectorCtrl', ['$log', '$scope', 'Data', function($log, $scope, Data){
    $log.debug('MyApp.selectors.ScopeSelectorCtrl: Initialized');

    // Load items from data
    loadScopes();
    $scope.$on('DataLoaded', loadScopes);
    function loadScopes(){
        $scope.scopes = Data.scopes;
        $scope.selectedScope = $scope.scopes[0];
        Data.setScope($scope.selectedScope);
    }

    // Select item
    $scope.selectScope = function(item){
        $scope.selectedScope = item;
        Data.setScope($scope.selectedScope);
    }

}]);
