var module = angular.module('app', []);

module.directive('wysihtml5', [
	'$parse', '$timeout',
	function ($parse, $timeout) {
		return {
			restrict: 'A',
			scope: {
				wysihtml5Dynamic: '='
			},

			link: function ($scope, element, attrs, controller) {

				$scope.model = function (model) {
					// getter and setter on model
					var getter = $parse(attrs.wysihtml5);
					if (model !== undefined) {
						getter.assign($scope.$parent, model);
					}
					return getter($scope.$parent);
				};

				$scope.resize_editor = function () {
					var sandbox = element.siblings(".wysihtml5-sandbox");
					if(sandbox.height() != $scope.editor.composer.element.offsetHeight) {
						// body style gives padding 1 px;
						var padding_border = sandbox.outerHeight() - sandbox.height();
						var height = $scope.editor.composer.element.offsetHeight - 1 + padding_border;
						sandbox.height(height);
					}
				};

				$scope.activate = function () {
					// initialize wysihtml5 with the model
					element.val($scope.model());

					// create wysihtml5
					$scope.editor = new wysihtml5.Editor($scope.element_id, {
						parserRules: wysihtml5ParserRules
					});

					// bind editor to the model
					$scope.editor.on('blur', function () {
						if ($scope.editor && $scope.editor.synchronizer) {
							$scope.editor.synchronizer.sync();
							$scope.$apply(function () {
								$scope.model(element.val());
							});

							$scope.$apply(function () {
								$scope.$emit('wysihtml5_blur');
							});
						}
					});

					$scope.editor.on("load", function () {
						// remove min height style on body
						var styles = $($scope.editor.composer.doc).find('head style');
						styles.html(styles.html().replace('min-height: 100%; ', ''));

						// autosizing
						$scope.resize_editor();
						$($scope.editor.composer.element).bind('input focus blur', $scope.resize_editor);
					});

					// autosizing
					$scope.editor.on("aftercommand:composer", $scope.resize_editor);
				};

				$scope.desactivate = function () {
					// FIX ME see https://github.com/xing/wysihtml5/issues/124
					$scope.editor.composer.sandbox.destroy();
					element.show();
					$scope.editor = null;
				};

				(function init() {
					// wysihtml5 must be enclosed in a div in order to not screw with angular
					element.wrap('<div></div>');

					// add a generated id
					$scope.element_id = element.attr('id');
					if (!$scope.element_id) {
						$scope.element_id = "wysihtml5-textarea-" + new Date().getTime();
						element.attr('id', $scope.element_id);
					}

					if ($scope.wysihtml5Dynamic) {
						$scope.$on("wysihtml5_activate", $scope.activate);
						$scope.$on("wysihtml5_desactivate", $scope.desactivate);
					}
					else {
						$scope.activate();
					}
				})();
			}
		};
	}
]);


function AppCtrl($scope) {
	$scope.wysihtml5 = {
		content: ''
	};
}
AppCtrl.$inject = ['$scope'];
