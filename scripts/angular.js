angular.module('MyApp', [
  'MyApp.map'
])
.controller('MainController',['$scope', function($scope) {
  scope = this;
  scope.selectedMunicipality = 'yay';

  $scope.$on('MunicipalitySelected', function(event, municipality, element){
    console.log(municipality.gm_naam);
    scope.selectedMunicipality = municipality.gm_naam;
    console.log(scope);
  });

}]);
