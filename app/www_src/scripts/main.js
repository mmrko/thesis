// Shim for Ripple
// http://stackoverflow.com/questions/17250796/phonegap-2-8-0-raising-no-method-overridebackbutton-with-angular-mobile-nav
if(!!window.tinyHippos && !!window.cordova) {
    cordova.addDocumentEventHandler('backbutton');
    document.addEventListener("backbutton", function() { alert("Pressed back"); });
}

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic']).run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {

    });
});
