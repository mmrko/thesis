var app = angular.module('luminotrace', [
    'ionic',
    'luminotrace.controllers',
    'luminotrace.templates'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('foo', {
            url: '/foo',
            templateUrl: 'templates/foo.html'
        });
});

app.run(function ($ionicPlatform, $templateCache) {

    $ionicPlatform.ready(function () {
        console.log(device, navigator.camera);
    });

});
