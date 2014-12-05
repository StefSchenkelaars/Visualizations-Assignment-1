angular.module('MyApp', [
    'MyApp.map',
    'MyApp.extract',
    'MyApp.selectors'
])


// .controller('MainController',['$rootScope', '$scope', 'Wikipedia', function($rootScope, $scope, Wikipedia) {
//     scope = this;
//     scope.selectedMunicipality = undefined;
//
//     $scope.$on('MunicipalitySelected', function(event, municipality){
//         scope.selectedMunicipality = municipality;
//         scope.extract = undefined;
//         if(!$scope.$$phase) {
//             $scope.$apply();
//         }
//         Wikipedia.get(municipality.gm_naam).then(function(extract){
//             scope.extract = extract;
//         });
//     });
//
//     $scope.$on('MunicipalityDeselected', function(){
//         $scope.$apply(function () {
//             scope.selectedMunicipality = undefined;
//             scope.extract = undefined;
//         });
//     });
//
//     scope.selectItem = function(item, model){
//         data = g.selectAll('path').data();
//         var municipality = data.filter(function(element){
//             return element.gm_code === item.GM_CODE;
//         })[0];
//         $rootScope.$broadcast('MunicipalitySelected', municipality);
//     };
//
// }])
//
// .service('Wikipedia', ['$http', '$q', function($http, $q){
//     that = this;
//
//     that.get = function(query){
//         var defer = $q.defer();
//
//         $http({
//             method: 'GET',
//             url: 'https://wikipedia-proxy.herokuapp.com/' + query,
//         })
//         .success(function(data, status, headers, config) {
//             // this callback will be called asynchronously
//             // when the response is available
//             defer.resolve(data);
//         }).error(function(data, status, headers, config) {
//             // called asynchronously if an error occurs
//             // or server returns response with an error status.
//             defer.resolve('Geen informatie beschikbaar');
//         });
//
//         return defer.promise
//     };
//
//
// }])
//
.directive('spinner', function(){
    return {
        restrict: 'E',
        template: '<div class="spinner"><div class="cube1"></div><div class="cube2"></div></div>'
    }
});
