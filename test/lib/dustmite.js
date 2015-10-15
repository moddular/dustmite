
'use strict';

var assert = require('proclaim');
var path = require('path');

var Dustmite = require(path.join(__dirname, '..', '..', 'lib', 'dustmite'));

describe('lib/dustmite', function() {
	it('Should export a `Validator` function', function() {
		assert.isFunction(Dustmite.Validator);
	});

	it('Should export a `Reporter` function', function() {
		assert.isFunction(Dustmite.Reporter);
	});

	it('Should export a `Parser` function', function() {
		assert.isFunction(Dustmite.Parser);
	});

	it('Should export a `Node` function', function() {
		assert.isFunction(Dustmite.Node);
	});

	it('Should export a `Rules` object', function() {
		assert.isObject(Dustmite.Rules);
	});
});
