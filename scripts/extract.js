angular.module('MyApp.extract', [
    'MyApp.data'
])
.directive('extract', [function(){
    return {
        restrict: 'E',
        scope: true,
        template: '<div id="extract">\
            <spinner ng-show="extract.loading"></spinner>\
            <span>{{extract.extract}}</span>\
            <span ng-show="!extract.loading && !extract.extract">Informatie van gemeente</span>\
        </div>',
        controller: 'MyApp.extract.controller',
        controllerAs: 'extract'
    }
}])
.controller('MyApp.extract.controller', ['$scope', 'Data', 'Wikipedia', function($scope, Data, Wikipedia){
    scope = this;
    scope.extract = null;
    scope.loading = false;
    $scope.$on('NodeDeselected', function(){
        scope.extract = null;
        scope.loading = false;
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    });
    $scope.$on('NodeSelected', function(){
        scope.extract = null;
        scope.loading = true;
        Wikipedia.get(Data.activeNode.data()[0].gm_naam).then(function(extract){
            scope.extract = extract;
            scope.loading = false;
        });
        if(!$scope.$$phase) {
            $scope.$apply();
        }
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
