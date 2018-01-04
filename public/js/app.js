/**
 * @author hsingh36
 */
(function () {

    var myApp = angular.module("bgmsApp", ['bgms.controllers', 'bgms.services', 'cfl.interceptors', 'bgms.filters', 'ngRoute', 'ui.bootstrap']);

    myApp.config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when("/", {
                controller: "homeCtrl",
                templateUrl: "/partials/home.html"
            })
            .when("/contract", {
                controller: "contractCtrl",
                templateUrl: "/partials/contractDetails.html"
            })
            .when("/bank", {
                controller: "bankCtrl",
                templateUrl: "/partials/bankDetails.html"
            })
            .when("/contractor", {
                controller: "contractorCtrl",
                templateUrl: "/partials/contractorDetails.html"
            })
            .otherwise('/access-denied', {
                controller: "accessDeniedCtrl",
                templateUrl: "/partials/access-denied.html"
            });

    }]);

    myApp.config(['$httpProvider',
     function ($httpProvider) {
        $httpProvider.interceptors.push('errorInterceptor');
    }]);

})();