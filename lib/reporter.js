
'use strict';

var util = require('util');

var Reporter = function(file) {
	this.file = file;
	this.errors = [];
};

Reporter.prototype.add = function(line, column) {
	this.errors.push({
		message: util.format.apply(util, [].slice.call(arguments, 2)),
		line: line,
		column: column
	});
	return this.errors;
};

Reporter.prototype.format = function() {
	return '\nValidating ' + this.file + '\n' + this.errors.map(function(error) {
		return util.format('  [ERROR] line %d column %d %s', error.line, error.column, error.message);
	}).join('\n') + '\n  ' + this.count() + ' error' + ((this.count() !== 1) ? 's' : '');
};

Reporter.prototype.status = function() {
	return this.count() === 0 ? 0 : 1;
};

Reporter.prototype.count = function() {
	return this.errors.length;
};

module.exports = Reporter;
