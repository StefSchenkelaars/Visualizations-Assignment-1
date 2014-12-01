angular.module('MyApp', [
  'MyApp.map',
  'ui.bootstrap'
])
.controller('MainController',['$scope', function($scope) {
  $scope.selectedMunicipality = 'yay';

  $scope.$on('MunicipalitySelected', function(event, municipality, element){
    $scope.$apply(function () {
        $scope.selectedMunicipality = municipality.gm_naam;
    });
  });

}]);
