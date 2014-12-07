angular.module('MyApp', [
    'MyApp.map',
    'MyApp.legend',
    'MyApp.extract',
    'MyApp.selectors',
    'MyApp.results',
    'MyApp.origin'
])
.directive('spinner', function(){
    return {
        restrict: 'E',
        template: '<div class="spinner"><div class="cube1"></div><div class="cube2"></div></div>'
    }
});

// http://blog.magnetiq.com/post/497605344/rounding-to-a-certain-significant-figures-in
function sigFigs(n, sig) {
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    };
