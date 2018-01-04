(function () {
    'use strict';

    var interceptors = angular.module('cfl.interceptors', []);
    interceptors.factory('errorInterceptor', ['$q', '$rootScope', '$timeout', '$window', '$location',
                                    function ( $q, $rootScope, $timeout, $window, $location ) {
            return {
                request: function (config) {
                    return config || $q.when(config);
                },
                requestError: function(request){
                    return $q.reject(request);
                },
                response: function (response) {
                    var target = $location.absUrl();
                    if ($location.absUrl().indexOf('index.html') === -1) {
                        $window.location.href = target.replace(/BGMS.*$/, 'BGMS/index.html');
                    }
                    if (response.status === 200 && response.config.url === "/login") {
                        $window.location.href = target.replace(/login.html.*$/, 'index.html');
                    }
                    return response;
                },
                responseError: function (response) {
                    var target = $location.absUrl();
                    console.log(response);
                    if (response.status === 401 && (response.data === 'SESSION_EXPIRED' || response.data === 'LOGOUT')) {
                        var message = (response.data==="SESSION_EXPIRED")? 'invalid.token' : 'logout';
                        $window.location.href = target.replace(/index.html.*$/, 'login.html?message=' + message);
                    }
                    return $q.reject(response);
                }
            };
        }]);
}());

