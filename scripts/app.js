angular.module('MyApp', [
    'MyApp.map',
    'MyApp.legend',
    'MyApp.extract',
    'MyApp.selectors'
])
.directive('spinner', function(){
    return {
        restrict: 'E',
        template: '<div class="spinner"><div class="cube1"></div><div class="cube2"></div></div>'
    }
});
