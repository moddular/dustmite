
'use strict';

var assert = require('proclaim');
var path = require('path');

var logger = require(path.join(__dirname, '..', '..', 'lib', 'logger'));

describe('lib/logger', function() {
	it('Should export an object', function() {
		assert.isObject(logger);
	});

	it('Should export a `set` function', function() {
		assert.isFunction(logger.set);
	});

	it('Should export a `get` function', function() {
		assert.isFunction(logger.get);
	});

	it('Should return `console` by default when `get` is called', function() {
		assert.strictEqual(console, logger.get());
	});

	it('Should return the argument when `set` is called', function() {
		var replacementConsole = {
			log: function() { },
			error: function() { }
		};
		assert.strictEqual(replacementConsole, logger.set(replacementConsole));
	});

	it('Should return the current logger when `get` is called', function() {
		var replacementConsole = {
			log: function() { },
			error: function() { }
		};
		logger.set(replacementConsole);
		assert.strictEqual(replacementConsole, logger.get());
	});

	it('Should throw an error when trying to set the logger as a non-object', function() {
		var replacementConsole = 'foo';
		assert.throws(function() {
			logger.set(replacementConsole);
		});
	});

	it('Should throw an error if the logger doesn\'t support the log method', function() {
		var replacementConsole = {
			error: function() { }
		};
		assert.throws(function() {
			logger.set(replacementConsole);
		});
	});

	it('Should throw an error if the logger doesn\'t support the error method', function() {
		var replacementConsole = {
			log: function() { }
		};
		assert.throws(function() {
			logger.set(replacementConsole);
		});
	});

	it('Should allow the logger to be reset to `console`', function() {
		assert.strictEqual(console, logger.set(console));
		assert.strictEqual(console, logger.get());
	});
});
