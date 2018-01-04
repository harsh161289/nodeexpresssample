/* globals angular, moment */
/**
 * @author hsingh36
 */
(function() {

	var controllers = angular.module('bgms.controllers', []);

	controllers.controller('bgmsCtrl', ['$scope', '$log', 'userService', 'CONFIG', function($scope, $log, userService, CONFIG) {
		var todaysDate = new Date();

		$scope.message = "not sure what to show";

		$scope.logout = function() {
			userService.logout();
		};

		$scope.modalOptions = {
			bodyText: "Are you sure you want to continue",
			headerText: "Confirm..",
			actionButtonText: "Yes",
			closeButtonText: "No",
			secondActionButtonText: "Cancel"
		};

		$scope.dateOptions = {
			formatYear: 'yyyy',
			maxDate: new Date().setFullYear(todaysDate.getFullYear() + 30),
			minDate: new Date().setFullYear(todaysDate.getFullYear() - 30),
			startingDay: 1,
			showWeeks: false
		};

		$scope.getTypeOfBG = function(type) {
			return CONFIG.TYPE_OF_BG[type];
		};

	}]);

	controllers.controller('loginCtrl', ['$scope', '$log', 'userService', function($scope, $log, userService) {

		$scope.login = function() {
			$scope.isSubmitted = true;
			if ($scope.loginForm.$valid) {
				userService.signIn($scope.user, function(data) {
					//succcess
					$log.log('user signin success' + JSON.stringify(data));
				}, function(data) {
					//error
					$log.log('user signin error' + JSON.stringify(data));
				});
			}
		};
	}]);

	controllers.controller('homeCtrl', ['$scope', '$log', 'contractService', 'utils', function($scope, $log, contractService, utils) {
		var todaysDate = moment(),
			formatContract = function(contracts) {
				angular.forEach(contracts, function(contract) {
					if (moment(contract.validityDate).subtract(30, 'days').isAfter(todaysDate.toDate())) {

						if ((moment(contract.validityDate).subtract(30, 'days').diff(todaysDate, 'days') < 4) && !contract.reminderToBankStatus) {
							contract.type = 'EXTEND';
						}
					} else if (moment(contract.validityDate).subtract(30, 'days').isBefore(todaysDate.toDate())) {
						if (!contract.reminderToBankStatus) {
							contract.type = 'EXTEND';
						} else if (moment(contract.validityDate).subtract(15, 'days').isAfter(todaysDate.toDate())) {
							if (moment(contract.validityDate).subtract(15, 'days').diff(todaysDate, 'days') < 4) {
								contract.type = 'ENCASH';
							}
						} else {
							// todays date is after 15 days
							if (!contract.encashmentToBankStatus) {
								contract.type = 'ENCASH';
							}
						}

					}
				});
				return contracts;
			},
			updatePagination = function(count) {
				if ($scope.query.alsoRetrieveCount) {
					$scope.totalRecords = angular.fromJson(count);
					$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
				}
			},
			fetchContractData = function() {
				contractService.fetchAll({
					type: 'EXPIRY'
				}, function(data) {
					$scope.contractDetails = formatContract(data);
				}, function(error) {
					$log.error(error);
				});
			},
			init = function() {
				$scope.query = contractService.current.query;
				fetchContractData();
			};
		init();
		$scope.show = false;
		$scope.contractDetailsField = contractService.homePageFields;

		$scope.sendMail = function(contractDetails) {
			contractService.sendMail(contractDetails.id, contractDetails.type, function(data) {
				$scope.contractDetails = data;
			}, function(error) {
				$log.log('Error occured for sending mail for contract ' + contractDetails.id);
			});
		};

		$scope.extendValidity = function() {
			$scope.isSubmitted = true;

			if ($scope.validityExtenstionForm.$valid) {
				contractService.extendContract($scope.contract.id, $scope.validityDate, function() {
					fetchContractData();
					$scope.cancel();
					$scope.isSubmitted = false;
				});
			}

		};

		$scope.cancel = function() {
			$scope.searchContract = null;
			$scope.contract = null;
			$scope.validityDate = null
			$scope.validityExtenstionForm.$setPristine();
		};

		$scope.openCalender = function() {
			$scope.opened = true;
		};

		$scope.searchForContract = function(searchTxt) {
			return contractService.searchForContract(searchTxt).then(function(response) {
				return response.data.map(function(contract) {
					contract.displayName = utils.formatDisplayName(contract.caNumberAndNameOfWork, contract.fileNumber, contract.bgNumber);
					return contract;
				});
			});
		};

		$scope.selectedContract = function(contract, item, model, event) {
			$scope.contract = contract;
		};

	}]);

	controllers.controller('accessDeniedCtrl', ['$scope', '$log', function($scope, $log) {
		$log.log('Loading Access Denied..');
	}]);

	controllers.controller('bankCtrl', ['$scope', '$log', 'CONFIG', 'bankService', 'modalService', 'utils', function($scope, $log, CONFIG, bankService, modalService, utils) {
		var defaultQuery = {
				page: CONFIG.DEFAULT_PAGE,
				pageSize: CONFIG.DEFAULT_PAGE_SIZE,
				sort: 'modifiedOn',
				order: 'desc',
				alsoRetrieveCount: true
			},
			defaultBanksWithCount = {},
			options = angular.extend($scope.modalOptions, {
				bodyText: "Bank details updated successfully",
				actionButtonText: "Okay",
				showSecondBtn: false,
				closeModal: function() {
					$scope.bank = {};
					$scope.bankDetailsForm.$setPristine();
					$scope.isSubmitted = false;
				}
			}),
			updatePagination = function(count, flag) {
				if ($scope.query.alsoRetrieveCount || flag) {
					$scope.totalRecords = angular.fromJson(count);
					$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
				}
			},
			fetchBankData = function(initial) {
				bankService.fetchAll({
					type: 'ALL'
				}, function(data) {
					$scope.banks = data.banks;
					$scope.count = data.count;
					updatePagination(data.count);
					if (initial) {
						defaultBanksWithCount.banks = angular.copy($scope.banks);
						defaultBanksWithCount.count = angular.copy($scope.count);
					}
				}, function(error) {
					$log.error(error);
				});
			},
			init = function() {
				$scope.query = bankService.current.query = defaultQuery;
				fetchBankData('init');
				$scope.pageSizes = bankService.pageSizes;
			};
		init();

		$scope.bankFields = bankService.bankTableFields;
		$scope.reverse = ($scope.query.order === 'desc') ? true : false;

		$scope.order = function(predicate, reverse) {
			$scope.query.sort = predicate;
			$scope.query.order = reverse ? 'desc' : 'asc';
			$scope.query.alsoRetrieveCount = false;
			fetchBankData();
		};

		$scope.resetPageSize = function(size) {
			$scope.query.pageSize = size;
			$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
			// reset current page whenever page size is changed
			$scope.query.page = 1;
			fetchBankData();
		};

		$scope.gotoPage = function(page) {
			if (page !== 0 && page <= $scope.totalPages) {
				$scope.query.page = page;
				$scope.query.alsoRetrieveCount = false;
				fetchBankData();
			}
		};

		$scope.save = function() {
			$scope.isSubmitted = true;
			if ($scope.bankDetailsForm.$valid) {
				bankService.save($scope.bank, function(data) {
					$scope.banks = data.banks;
					updatePagination(data.count);
					modalService.showModal({}, options).then(function() {
						$scope.bank = {};
						$scope.bankDetailsForm.$setPristine();
						$scope.isSubmitted = false;
					});
				}, function(error) {
					$log.error(error);
				});
			}
		};

		$scope.searchForBank = function(searchTxt) {
			return bankService.searchForBank(searchTxt).then(function(response) {
				$scope.banks = response.data;
				$scope.totalRecords = response.data.length;
				updatePagination($scope.totalRecords, true);
				return response.data.map(function(bank) {
					bank.displayName = utils.formatDisplayName(bank.bankName, bank.ifscNumber, bank.city, bank.state);
					return bank;
				});
			});
		};

		$scope.$watch("searchBank", function() {
			if ($scope.searchBank === '') {
				$scope.query.search = '';
				$scope.banks = defaultBanksWithCount.banks;
				$scope.totalRecords = defaultBanksWithCount.count;
				updatePagination($scope.totalRecords, true);
			}
		});

		$scope.selectedBank = function(selectedBank, model, label, event) {
			$scope.banks = [];
			$scope.banks.push(selectedBank);
			$scope.totalRecords = 1;
		};

		$scope.editBank = function(bank) {
			$scope.bank = angular.copy(bank);
		};
	}]);

	controllers.controller('contractorCtrl', ['$scope', '$log', 'CONFIG', 'contractorService', 'modalService', 'utils', function($scope, $log, CONFIG, contractorService, modalService, utils) {
		var defaultQuery = {
				page: CONFIG.DEFAULT_PAGE,
				pageSize: CONFIG.DEFAULT_PAGE_SIZE,
				sort: 'modifiedOn',
				order: 'desc',
				alsoRetrieveCount: true
			},
			defaultContractorsWithCount = {},
			options = angular.extend($scope.modalOptions, {
				bodyText: "contractor details updated successfully",
				actionButtonText: "Okay",
				showSecondBtn: false,
				closeModal: function() {
					$scope.contractor = {};
					$scope.contractorDetailsForm.$setPristine();
					$scope.isSubmitted = false;
				}
			}),
			updatePagination = function(count, flag) {
				if ($scope.query.alsoRetrieveCount || flag) {
					$scope.totalRecords = angular.fromJson(count);
					$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
				}
			},
			fetchContractorData = function(initial) {
				contractorService.fetchAll({
					type: 'ALL'
				}, function(data) {
					$scope.contractors = data.contractors;
					$scope.count = data.count;
					updatePagination(data.count);
					if (initial) {
						defaultContractorsWithCount.contractors = angular.copy(data.contractors);
						defaultContractorsWithCount.count = angular.copy(data.count);
					}
				}, function(error) {
					$log.error(error);
				});
			},
			init = function() {
				$scope.query = contractorService.current.query;
				fetchContractorData('init');
				$scope.pageSizes = contractorService.pageSizes;
			};
		init();

		$scope.contractorFields = contractorService.contractorFields;
		$scope.reverse = ($scope.query.order === 'desc') ? true : false;

		$scope.order = function(predicate, reverse) {
			$scope.query.sort = predicate;
			$scope.query.order = reverse ? 'desc' : 'asc';
			$scope.query.alsoRetrieveCount = false;
			fetchContractorData();
		};

		$scope.resetPageSize = function(size) {
			$scope.query.pageSize = size;
			$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
			// reset current page whenever page size is changed
			$scope.query.page = 1;
			fetchContractorData();
		};

		$scope.gotoPage = function(page) {
			if (page !== 0 && page <= $scope.totalPages) {
				$scope.query.page = page;
				$scope.query.alsoRetrieveCount = false;
				fetchContractorData();
			}
		};

		$scope.searchForContractor = function(searchTxt) {
			return contractorService.searchForContractor(searchTxt).then(function(response) {
				$scope.contractors = response.data;
				$scope.totalRecords = response.data.length;
				updatePagination($scope.totalRecords, true);
				return response.data.map(function(contractor) {
					contractor.displayName = utils.formatDisplayName(contractor.nameOfFirm, contractor.emailId, contractor.mesRegistrationNumber, contractor.city);
					return contractor;
				});
			});
		};

		$scope.$watch("contractorSearchText", function() {
			if ($scope.contractorSearchText === '') {
				$scope.query.search = '';
				$scope.contractors = defaultContractorsWithCount.contractors;
				$scope.totalRecords = defaultContractorsWithCount.count;
				updatePagination($scope.totalRecords, true);
			}
		});

		$scope.selectedContractor = function(selectedContractor, model, label, event) {
			$scope.contractors = [];
			$scope.contractors.push(selectedContractor);
			$scope.totalRecords = 1;
		};

		$scope.save = function() {
			$scope.isSubmitted = true;
			if ($scope.contractorDetailsForm.$valid) {
				contractorService.save($scope.contractor, function(data) {
					$scope.contractors = data.contractors;
					updatePagination(data.count);
					modalService.showModal({}, options).then(function() {
						$scope.contractor = {};
						$scope.contractorDetailsForm.$setPristine();
						$scope.isSubmitted = false;
					});
				});
			}
		};

		$scope.editContractor = function(contractor) {
			$scope.contractor = angular.copy(contractor);
		};

		$scope.validate = function(fieldName, value) {
			if (value) {
				contractorService.findBy(fieldName, value, function(data) {
					if (data.length > 0) {
						$scope.contractorDetailsForm[fieldName].$setValidity('conflict', false);
					} else {
						$scope.contractorDetailsForm[fieldName].$setValidity('conflict', true);
					}
				});
			}
		};
	}]);

	controllers.controller('contractCtrl', ['$scope', '$log', 'contractService', 'CONFIG', 'modalService', 'utils', function($scope, $log, contractService, CONFIG, modalService, utils) {
		var updatePagination = function(count) {
				if ($scope.query.alsoRetrieveCount) {
					$scope.totalRecords = angular.fromJson(count);
					$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
				}
			},
			fetchContractData = function() {
				contractService.fetchAll({
					type: 'ALL'
				}, function(data) {
					$scope.contracts = data.contracts;
					updatePagination(data.count);
				}, function(error) {
					$log.error(error);
				});
			},
			init = function() {
				$scope.query = contractService.current.query;
				fetchContractData();
				$scope.pageSizes = contractService.pageSizes;
			};
		init();

		$scope.contractFields = contractService.contractFields;
		$scope.typesOfBG = CONFIG.TYPE_OF_BG;
		$scope.contract = {};

		$scope.openCalender = function() {
			$scope.opened = !$scope.opened;
		};
		

		$scope.order = function(predicate, reverse) {
			$scope.query.sort = predicate;
			$scope.query.order = reverse ? 'desc' : 'asc';
			fetchContractData();
		};

		$scope.resetPageSize = function(size) {
			$scope.query.pageSize = size;
			$scope.totalPages = Math.ceil($scope.totalRecords / $scope.query.pageSize);
			// reset current page whenever page size is changed
			$scope.query.page = 1;
			fetchContractData();
		};

		$scope.gotoPage = function(page) {
			if (page !== 0 && page <= $scope.totalPages) {
				$scope.query.page = page;
				fetchContractData();
			}
		};

		$scope.searchForContract = function(searchTxt) {
			return contractService.searchForContract(searchTxt).then(function(response) {
				return response.data.map(function(contract) {
					contract.displayName = utils.formatDisplayName(contract.caNumberAndNameOfWork, contract.fileNumber, contract.bgNumber);
					return contract;
				});
			});
		};

		$scope.searchForContractor = function(searchTxt) {
			return contractService.searchForContractor(searchTxt).then(function(response) {
				return response.data.map(function(contractor) {
					contractor.displayName = utils.formatDisplayName(contractor.nameOfFirm, contractor.emailId, contractor.mesRegistrationNumber, contractor.city);
					return contractor;
				});
			});
		};

		$scope.searchForBank = function(searchTxt) {
			return contractService.searchForBank(searchTxt).then(function(response) {
				return response.data.map(function(bank) {
					bank.displayName = utils.formatDisplayName(bank.bankName, bank.ifscNumber, bank.city, bank.state);
					return bank;
				});
			});
		};

		$scope.selectedContractor = function(contractor, item, model, event) {
			$scope.contract.contractor = contractor.id;
		};

		$scope.selectedBank = function(bank, item, model, event) {
			$scope.contract.bank = bank.id;
		};

		$scope.selectedBGType = function(type) {
			$scope.contract.typeOfBG = type;
		};
		

		$scope.reset = function() {
			$scope.contract = {};
			$scope.contract.bank = null;
			$scope.contract.contractor = null;
			$scope.bankSearchText = null;
			$scope.contractorSearch = null;
			$scope.contractDetailsForm.$setPristine();
		};

		$scope.validateForm = function() {
			if (! $scope.contract.bank && $scope.bankSearchText) {
				$scope.contractDetailsForm.bank.$setValidity('not-valid', false);
			} else {
				$scope.contractDetailsForm.bank.$setValidity('not-valid', true);
			}
			if (! $scope.contract.contractor && $scope.contractorSearch) {
				$scope.contractDetailsForm.contractor.$setValidity('not-valid', false);
			} else {
				$scope.contractDetailsForm.contractor.$setValidity('not-valid', true);
			}
		};

		$scope.submit = function() {
			$scope.isSubmitted = true;
			var options = angular.extend($scope.modalOptions, {
				bodyText: "Contract details saved successfully",
				headerText: "Confirm",
				actionButtonText: "Yes",
				closeButtonText: "No",
				closeModal: function() {
					$scope.reset();
					$scope.isSubmitted = false;
				}
			});
			$scope.validateForm();
			if ($scope.contractDetailsForm.$valid) {
				contractService.save($scope.contract, function(data) {
					$scope.contracts = data.contracts;
					updatePagination(data.count);
					modalService.showModal({}, options).then(function() {
						$scope.reset();
						$scope.isSubmitted = false;
					});
				}, function(data) {
					// error
				});
			}
		};

		$scope.editContract = function(contract) {
			$scope.contract = angular.copy(contract);
			$scope.contract.validityDate = new Date(contract.validityDate);
			$scope.bankSearchText = contract.bank.bankName + ' / ' + contract.bank.ifscNumber + ' / ' + contract.bank.city;
			$scope.contractorSearch = contract.contractor.nameOfFirm + ' / ' + contract.contractor.city + ' / ' + contract.contractor.mesRegistrationNumber;
		};

	}]);

})();