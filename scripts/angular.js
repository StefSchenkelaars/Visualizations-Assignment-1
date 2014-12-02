angular.module('MyApp', [
    'MyApp.map',
    'ui.bootstrap',
    'ui.select'
])
.controller('MainController',['$scope', function($scope) {
    $scope.selectedMunicipality = undefined;

    $scope.$on('MunicipalitySelected', function(event, municipality, element){
        $scope.$apply(function () {
            $scope.selectedMunicipality = municipality;
        });
    });

}]);
