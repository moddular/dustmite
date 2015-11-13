
'use strict';

module.exports = function(Reporter, Parser) {
	Reporter = Reporter || require('./reporter');
	Parser = Parser || require('./parser');

	var fs = require('fs');
	var logger = require('./logger').get();

	var Validator = function(files, rules) {
		this.total = 0;
		this.tested = 0;
		this.files = files;
		this.rules = rules;
	};

	Validator.prototype.run = function() {
		return this.files.reduce(this.validate.bind(this), 0);
	};

	Validator.prototype.validate = function(status, file) {
		var reporter = new Reporter(file);
		var parser = new Parser();
		var count = 0;

		var test = function(node) {
			var rules = this.rules[node.type] || [];
			rules.forEach(function(rule) {
				var test = rule.test || rule;
				test(function() {
					var args = [
						node.line(),
						node.column()
					].concat([].slice.call(arguments, 0));
					reporter.add.apply(reporter, args);
				}, node, rule.meta);
			});
		};

		parser.on('node', test.bind(this));
		parser.parse(this.read(file), reporter);
		parser.removeAllListeners('node');

		count = reporter.count();
		this.total += count;
		this.tested++;

		if (count > 0) {
			logger.log(reporter.format());
		}
		return status || reporter.status();
	};

	Validator.prototype.read = function(file) {
		return fs.readFileSync(file, 'utf8');
	};

	Validator.prototype.report = function() {
		return '\n' + this.tested + ' files tested, ' + this.total + ' errors found';
	};

	Validator.prototype.log = function() {
		logger.log(this.report());
	};

	return Validator;
};
