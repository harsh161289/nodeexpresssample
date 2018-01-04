(function() {
	'use strict';

	var filters = angular.module('bgms.filters', []);

	filters.filter('evalBoolean', function() {
		return function(input) {
			return (input) ? 'True' : 'False';
		}
	});

	filters.filter('replaceParams', function() {
		return function() {
			var args = Array.prototype.slice.call(arguments),
				txt = args[0],
				params = args.slice(1, args.length);

			angular.forEach(params, function(param, $index) {
				txt = txt.replace("{" + $index + "}", param);
			})
			return txt;
		}
	});

})();