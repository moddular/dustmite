
'use strict';

var isValidReference = function(name, type) {
	var optionalPattern = type === 'snake' ? '_' : 'A-Z';
	var pattern = new RegExp('^[\\$.a-z' + optionalPattern + '][\\$.a-z0-9' + optionalPattern + ']*$');
	return name.match(/[^.]\$/) || !name.match(pattern);
};

module.exports = {
	referencesMustBeSnakeCase: {
		type: 'reference',
		test: function(report, node) {
			var name = node.name();
			if (isValidReference(name, 'snake')) {
				report('References should be written in snake case, the name %s did not match the required pattern', name);
			}
		}
	},
	referencesMustBeCamelCase: {
		type: 'reference',
		test: function(report, node) {
			var name = node.name();
			if (isValidReference(name, 'camel')) {
				report('References should be written in camel case, the name %s did not match the required pattern', name);
			}
		}
	},
	helpersMustBeSnakeCase: {
		type: '@',
		test: function(report, node) {
			var name = node.name();
			if (!name.match(/^[a-z][a-z0-9_]*$/)) {
				report('Helpers should be written in snake case, the name %s did not match the required pattern', name);
			}
		}
	},
	helpersMustBeCamelCase: {
		type: '@',
		test: function(report, node) {
			var name = node.name();
			if (!name.match(/^[a-z][a-z0-9]*$/i)) {
				report('Helpers should be written in camel case, the name %s did not match the required pattern', name);
			}
		}
	},
	helperMustNotBeUsed: {
		type: '@',
		test: function(report, node, names) {
			var name = node.name();
			names = names || ['if'];
			if (names.indexOf(name) !== -1) {
				report('The @%s helper must not be used', name);
			}
		}
	},
	escapeCharactersMustBeValid: {
		type: 'special',
		test: function(report, node) {
			var name = node.name();
			if (!name.match(/^(s|n|r|lb|rb)$/)) {
				report('The escape sequence ~%s is not a valid in dust. The allowed characters are ~s (space) ~n (newline) ~r (carriage return) ~lb (left brace) and ~rb (right brace)', name);
			}
		}
	},
	helperMustBeInsideSection: {
		type: '@',
		test: function(report, node, names) {
			var name = node.name();
			var valid = false;
			names = names || ['sep', 'first', 'last'];
			if (names.indexOf(name) !== -1) {
				for (var i = 0; node.stack[i]; ++i) {
					if (node.stack[i].type === '#') {
						valid = true;
						break;
					}
				}
				if (!valid) {
					report('The helper @%s must only be used inside a {#} ... {/} block', name);
				}
			}
		}
	},
	helperMustBeInsideSelect: {
		type: '@',
		test: function(report, node, names) {
			var name = node.name();
			var valid = false;
			names = names || ['none', 'any'];
			if (names.indexOf(name) !== -1) {
				for (var i = 0; node.stack[i]; ++i) {
					if (node.stack[i].type === '@' && node.stack[i].name() === 'select') {
						valid = true;
						break;
					}
				}
				if (!valid) {
					report('The helper @%s must only be used inside @select', name);
				}
			}
		}
	},
	helperMustHaveBody: {
		type: '@',
		test: function(report, node, names) {
			var name = node.name();
			names = names || ['sep', 'first', 'last'];
			if (names.indexOf(name) !== -1 && node.countBodies() !== 1) {
				report('The helper @%s must contain a body', name);
			}
		}
	}
};
