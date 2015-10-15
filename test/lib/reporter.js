
'use strict';

var assert = require('proclaim');
var path = require('path');

var Reporter = require(path.join(__dirname, '..', '..', 'lib', 'reporter'));

describe('lib/reporter', function() {
	describe('add', function() {
		it('Should add an error containing the line, column and message to the end of the list', function() {
			var reporter = new Reporter('dummy.dust');

			var result = reporter.add(1, 10, 'Error');
			var error = result[result.length - 1];

			assert.strictEqual(error.line, 1);
			assert.strictEqual(error.column, 10);
			assert.strictEqual(error.message, 'Error');
		});

		it('Should allow format strings to be used in the message', function() {
			var reporter = new Reporter('dummy.dust');

			var result = reporter.add(2, 1, 'The name %s is invalid', 'foo');
			var error = result[result.length - 1];

			assert.strictEqual(error.line, 2);
			assert.strictEqual(error.column, 1);
			assert.strictEqual(error.message, 'The name foo is invalid');
		});
	});

	describe('status', function() {
		it('Should return a 0 status if there are no errors', function() {
			var reporter = new Reporter('dummy.dust');
			assert.strictEqual(reporter.status(), 0);
		});

		it('Should return a 1 status if there are errors', function() {
			var reporter = new Reporter('dummy.dust');
			reporter.add(1, 1, 'Error 1');
			assert.strictEqual(reporter.status(), 1);
			reporter.add(1, 1, 'Error 2');
			assert.strictEqual(reporter.status(), 1);
		});
	});

	describe('count', function() {
		it('Should return a count of the errors', function() {
			var reporter = new Reporter('dummy.dust');
			assert.strictEqual(reporter.count(), 0);
			reporter.add(1, 1, 'Error 1');
			assert.strictEqual(reporter.count(), 1);
			reporter.add(1, 1, 'Error 2');
			assert.strictEqual(reporter.count(), 2);
		});
	});

	describe('format', function() {
		var reporter;

		beforeEach(function() {
			reporter = new Reporter('dummy.dust');
		});

		it('Should include the file being validated', function() {
			assert.include(reporter.format(), 'Validating dummy.dust');
		});

		it('Should include the error messages displayed with line and column numbers', function() {
			reporter.add(10, 1, 'Error 1');
			reporter.add(22, 10, 'Error 2');

			assert.include(reporter.format(), '[ERROR] line 10 column 1 Error 1');
			assert.include(reporter.format(), '[ERROR] line 22 column 10 Error 2');
		});

		it('Should include a count of the errors', function() {
			assert.include(reporter.format(), '0 errors');
			reporter.add(10, 1, 'Error 1');
			assert.include(reporter.format(), '1 error');
			reporter.add(22, 10, 'Error 2');
			assert.include(reporter.format(), '2 errors');
		});
	});
});
