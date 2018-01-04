/* global angular */
/**
 * @author hsingh36
 */
(function() {

	var services = angular.module('bgms.services', []);

	services.constant('CONFIG', {
		DEFAULT_PAGE: 1,
		DEFAULT_PAGE_SIZE: 6,
		REST_API: {
			BANK: '/banks',
			CONTRACTOR: '/contractors',
			CONTRACT: '/contracts',
			CONTRACT_UPDATE: '/contracts/{0}',
			LOGIN: '/login',
			LOGOUT: '/logout',
			SEND_MAIL: '/contracts/{0}/notify'
		},
		URL: {},
		TYPE_OF_BG: {
			'RETENTION_MONEY': 'Retention Money',
			'MOBILIZATION_ADVANCE': 'Mobilization advance',
			'ADDITIONAL_SECURITY_DEPOSIT': 'Additional security deposit',
			'INDIVIDUAL_SECURITY_DEPOSIT': 'Individual security deposit',
			'PERFORMANCE_GUARANTEE': 'Performance guarantee',
			'FINAL_BILL': 'Finalbill'
		}
	});

	services.service('userService', ['$http', '$log', 'CONFIG', function($http, $log, CONFIG) {
		var service = {};

		service.signIn = function(user, success, error) {
			$http({
				method: 'POST',
				url: CONFIG.REST_API.LOGIN,
				data: user
			}).success(function(response) {
				success(response);
			}).error(function(response) {
				error(response);
			});
		};

		service.logout = function() {
			$http({
				method: 'POST',
				url: CONFIG.REST_API.LOGOUT
			});
		};

		return service;
	}]);

	services.service('contractService', ['$http', '$log', 'CONFIG', '$filter', function($http, $log, CONFIG, $filter) {
		var service = {};
		service.pageSizes = [6, 10, 50, 100];
		service.current = {};
		service.current.query = {
			page: CONFIG.DEFAULT_PAGE,
			pageSize: CONFIG.DEFAULT_PAGE_SIZE,
			sort: 'modifiedOn',
			order: 'desc',
			alsoRetrieveCount: true
		};

		service.homePageFields = [{
			name: 'id',
			displayName: 'S.No.',
			isSortable: 'true'
		}, {
			name: 'caNumberAndNameOfWork',
			displayName: 'CA no & name Of wORK',
			isSortable: 'true'
		}, {
			name: 'fileNumber',
			displayName: 'File no',
			isSortable: 'true'
		}, {
			name: 'nameOfFirm',
			displayName: 'Name of firm',
			isSortable: 'true'
		}, {
			name: 'typeOfBG',
			displayName: 'Type Of bg',
			isSortable: 'false'
		}, {
			name: 'amountOfBG',
			displayName: 'Amount of bg',
			isSortable: 'false'
		}, {
			name: 'bgNumber',
			displayName: 'BG no',
			isSortable: 'false'
		}, {
			name: 'validityDate',
			displayName: 'Validity date',
			isSortable: 'false'
		}, {
			name: 'bankAddress',
			displayName: 'Bank address',
			isSortable: 'false'
		}, {
			name: 'reminderDateToBank',
			displayName: 'Reminder date to bank',
			isSortable: 'false'
		}, {
			name: 'reminderDateToBankStatus',
			displayName: 'Reminder status',
			isSortable: 'false'
		}, {
			name: 'encashmentDateToBank',
			displayName: 'Encashment date to bank',
			isSortable: 'false'
		}, {
			name: 'encashmentDateToBankStatus',
			displayName: 'Encashment status',
			isSortable: 'false'
		}, {
			name: 'remarks',
			displayName: 'Remarks',
			isSortable: 'false'
		}];

		service.contractFields = [{
			name: 'id',
			displayName: 'S.No.',
			isSortable: 'true'
		}, {
			name: 'caNumberAndNameOfWork',
			displayName: 'CA No & Name Of WORK',
			isSortable: 'true'
		}, {
			name: 'fileNumber',
			displayName: 'File No',
			isSortable: 'true'
		}, {
			name: 'nameOfFirm',
			displayName: 'Name of Firm',
			isSortable: 'true'
		}, {
			name: 'typeOfBG',
			displayName: 'Type Of BG',
			isSortable: 'false'
		}, {
			name: 'amountOfBG',
			displayName: 'Amount of BG',
			isSortable: 'false'
		}, {
			name: 'bgNumber',
			displayName: 'BG No',
			isSortable: 'false'
		}, {
			name: 'validityDate',
			displayName: 'Validity Date',
			isSortable: 'false'
		}, {
			name: 'bankAddress',
			displayName: 'Bank Address',
			isSortable: 'false'
		}, {
			name: 'remarks',
			displayName: 'Remarks',
			isSortable: 'false'
		}];

		service.searchForContract = function(searchText) {
			var params = angular.extend({
				type: 'ANY'
			}, {
				searchTxt: searchText
			});
			return $http({
				method: 'get',
				url: CONFIG.REST_API.CONTRACT,
				params: params
			});
		};

		service.searchForContractor = function(searchText) {
			var params = angular.extend({
				type: 'ANY'
			}, {
				searchTxt: searchText
			});
			return $http({
				method: 'get',
				url: CONFIG.REST_API.CONTRACTOR,
				params: params
			});
		};

		service.searchForBank = function(searchText) {
			var params = angular.extend({
				type: 'ANY'
			}, {
				searchTxt: searchText
			});
			return $http({
				method: 'get',
				url: CONFIG.REST_API.BANK,
				params: params
			});
		};

		service.save = function(contract, success, error) {
			$http({
				method: contract.id ? 'PUT' : 'POST',
				url: CONFIG.REST_API.CONTRACT,
				data: contract
			}).success(function(data) {
				success(data);
			}).error(function(data) {
				error(data);
			});
		};

		service.fetchAll = function(params, success, error) {
			var param = angular.extend({}, params, service.current.query);
			$http({
				method: 'get',
				url: CONFIG.REST_API.CONTRACT,
				params: param
			}).success(function(response) {
				success(response);
			}).error(function(response) {
				error(response);
			});
		};

		service.sendMail = function(id, type, success, error) {
			$http({
				method: 'post',
				url: $filter('replaceParams')(CONFIG.REST_API.SEND_MAIL, id),
				data: {
					'type': type
				}
			}).success(function(data) {
				success(data);
			}).error(function(data) {
				error(data);
			});
		};

		service.extendContract = function(id, validityDate, next) {
			$http({
				method: 'PUT',
				url: $filter('replaceParams')(CONFIG.REST_API.CONTRACT_UPDATE, id),
				data: {
					'validityDate': validityDate
				}
			}).then(function(response) {
				if (response.status === 200) {
					next();
				}
			})
		};

		return service;
	}]);

	services.service('bankService', ['$http', '$log', 'CONFIG', function($http, $log, CONFIG) {
		var service = {};
		service.pageSizes = [6, 10, 50, 100];
		service.current = {};
		service.current.query = {
			page: CONFIG.DEFAULT_PAGE,
			pageSize: CONFIG.DEFAULT_PAGE_SIZE,
			sort: 'modifiedOn',
			order: 'desc',
			alsoRetrieveCount: true
		};

		service.bankTableFields = [{
			name: 'id',
			displayName: 'S.No.',
			isSortable: true
		}, {
			name: 'bankName',
			displayName: 'Bank Name',
			isSortable: true
		}, {
			name: 'ifscNumber',
			displayName: 'IFSC Number',
			isSortable: true
		}, {
			name: 'city',
			displayName: 'City',
			isSortable: true
		}, {
			name: 'state',
			displayName: 'State',
			isSortable: true
		}, {
			name: 'address',
			displayName: 'Address',
			isSortable: false
		}, ];

		service.fetchAll = function(params, success, error) {
			var param = angular.extend({}, params, service.current.query);
			$http({
				method: 'get',
				url: CONFIG.REST_API.BANK,
				params: param
			}).success(function(response) {
				success(response);
			}).error(function(response) {
				error(response);
			});
		};

		service.searchForBank = function(searchText, success, error) {
			var params = angular.extend({
				type: 'ANY'
			}, {
				searchTxt: searchText
			});
			return $http({
				method: 'get',
				url: CONFIG.REST_API.BANK,
				params: params
			});
		};

		service.save = function(bank, success, error) {
			$http({
				method: (bank.id) ? 'put' : 'post',
				url: CONFIG.REST_API.BANK,
				data: bank
			}).success(function(data) {
				success(data);
			}).error(function(data) {
				error(data);
			});
		};

		return service;
	}]);

	services.service('contractorService', ['$http', '$log', 'CONFIG', function($http, $log, CONFIG) {
		var service = {};
		service.current = {};
		service.pageSizes = [6, 10, 50, 100];
		service.current.query = {
			page: CONFIG.DEFAULT_PAGE,
			pageSize: CONFIG.DEFAULT_PAGE_SIZE,
			sort: 'modifiedOn',
			order: 'desc',
			alsoRetrieveCount: true
		};

		service.contractorFields = [{
			name: "id",
			displayName: "S.No.",
			isSortable: true
		}, {
			name: "nameoffirm",
			displayName: "Name of firm",
			isSortable: true
		}, {
			name: "emailId",
			displayName: "Email Id",
			isSortable: false
		}, {
			name: "contactNumber",
			displayName: "Contact Number",
			isSortable: false
		}, {
			name: "alternatenumber",
			displayName: "Alternate Number",
			isSortable: false
		}, {
			name: "city",
			displayName: "City",
			isSortable: false
		}, {
			name: "state",
			displayName: "State",
			isSortable: false
		}, {
			name: "address",
			displayName: "Address",
			isSortable: false
		}, {
			name: "mesregistrationnumber",
			displayName: "Registration Number",
			isSortable: false
		}, ];

		service.fetchAll = function(params, success, error) {
			var param = angular.extend({}, params, service.current.query);
			$http({
				method: 'get',
				url: CONFIG.REST_API.CONTRACTOR,
				params: param
			}).success(function(response) {
				success(response);
			}).error(function(response) {
				error(response);
			});
		};

		service.searchForContractor = function(searchText) {
			var params = angular.extend({
				type: 'ANY'
			}, {
				searchTxt: searchText
			});
			return $http({
				method: 'get',
				url: CONFIG.REST_API.CONTRACTOR,
				params: params
			});
		};

		service.save = function(contractor, success, error) {
			$http({
				method: (contractor.id) ? 'put' : 'post',
				url: CONFIG.REST_API.CONTRACTOR,
				data: contractor
			}).success(function(data) {
				success(data);
			}).error(function(data) {
				error(data);
			});
		};

		service.findBy = function(fieldName, value, success, error) {
			param = {
				type: 'VALIDATE',
				searchFor: fieldName,
				value: value
			}
			$http({
				method: 'GET',
				url: CONFIG.REST_API.CONTRACTOR,
				params: param
			}).success(function(data) {
				success(data);
			}).error(function(data) {

			})
		};

		return service;
	}]);

	services.service('modalService', ['$uibModal', '$log', function($uibModal, $log) {
		var modalDefaults = {
				backdrop: true,
				keyboard: true,
				modalFade: true,
				templateUrl: '/partials/modals/modal-activity-confirmation.html'
			},
			modalOptions = {};

		this.showModal = function(customModalDefaults, customModalOptions) {
			if (!customModalDefaults) {
				customModalDefaults = {};
			}
			customModalDefaults.backdrop = 'static';
			return this.show(customModalDefaults, customModalOptions);
		};

		this.show = function(customModalDefaults, customModalOptions) {
			//Create local objects to work with since we're in a singleton service
			var modalDefaultsLocal = {},
				modalOptionsLocal = {};

			//Map angular-ui modal custom defaults to modal defaults defined in service
			angular.extend(modalDefaultsLocal, modalDefaults, customModalDefaults);

			//Map modal.html $scope custom properties to defaults defined in service
			angular.extend(modalOptionsLocal, modalOptions, customModalOptions);
			if (!modalDefaultsLocal.controller) {
				modalDefaultsLocal.controller = function($scope, $uibModalInstance) {
					$scope.modalOptions = modalOptionsLocal;
					$scope.modalOptions.ok = function(result) {
						$uibModalInstance.close(result);
					};
					$scope.modalOptions.dismiss = function(result) {
						$uibModalInstance.dismiss('cancel');
					};
					$scope.modalOptions.close = function(result) {
						if ($scope.modalOptions.closeModal) {
							$scope.modalOptions.closeModal();
						}
						$uibModalInstance.dismiss('cancel');
					};
				};
			}

			return $uibModal.open(modalDefaultsLocal).result;
		};

	}]);

	services.factory('utils', function() {
		return {
			formatDisplayName: function() {
				var i,
					displayName = '',
					arr = Array.prototype.slice.call(arguments);
				for (i = 0; i < arr.length; i++) {
					if (arr[i]) {
						displayName = displayName + ((arr[i]) ? ((i === 0) ? arr[i] : ' / ' + arr[i]) : '');
					}
				}
				return displayName;
			}
		}
	});


})();