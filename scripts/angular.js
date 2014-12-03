angular.module('MyApp', [
    'MyApp.map',
    'ui.bootstrap',
    'ui.select'
])
.controller('MainController',['$scope', 'Wikipedia', function($scope, Wikipedia) {
    $scope.selectedMunicipality = undefined;

    $scope.$on('MunicipalitySelected', function(event, municipality, element){
        $scope.$apply(function () {
            $scope.selectedMunicipality = municipality;
            // Returns a promise
            $scope.extract = undefined;
            Wikipedia.get(municipality.gm_naam).then(function(extract){
                $scope.extract = extract;
            });
        });
    });

    $scope.$on('MunicipalityDeselected', function(){
        $scope.$apply(function () {
            $scope.selectedMunicipality = undefined;
            $scope.extract = undefined;
        });
    });

}])

.service('Wikipedia', ['$http', '$q', function($http, $q){
    that = this;

    that.get = function(query){
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'https://wikipedia-proxy.herokuapp.com/' + query,
        })
        .success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            defer.resolve(data);
        }).error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            defer.resolve('Geen informatie beschikbaar');
        });

        return defer.promise
    };


}]);
