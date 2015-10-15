
'use strict';

var assert = require('proclaim');
var path = require('path');
var dust = require('dustjs-linkedin');

var Node = require(path.join(__dirname, '..', '..', 'lib', 'node'));

var compile = function(template) {
	return dust.parse(template)[1];
};

describe('lib/node', function() {
	describe('name', function() {
		it('Should return the name of a special character', function() {
			[
				's',
				'n',
				'r',
				'lb',
				'rb'
			].forEach(function(character) {
				var node = new Node(compile('{~' + character + '}'));
				assert.strictEqual(node.name(), character);
			});
		});

		it('Should return the name of a helper', function() {
			[
				'{@foo/}',
				'{@foo bar="baz"/}',
				'{@foo}bar{/foo}',
				'{@foo bar="baz"}qu{:else}ux{/foo}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.name(), 'foo');
			});
		});

		it('Should return the name of a simple section', function() {
			[
				'{#sec}{/sec}',
				'{#sec foo="bar"}{/sec}',
				'{#sec:foo}{/sec}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.name(), 'sec');
			});
		});

		it('Should return the name of a section path', function() {
			[
				'{#a.sec}{/a.sec}',
				'{#a.sec foo="bar"}{/a.sec}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.name(), 'a.sec');
			});
		});

		it('Should return the name of a simple conditional', function() {
			[
				'{?foo}{/foo}',
				'{?foo}foo{:else}bar{/foo}',
				'{^foo}{/foo}',
				'{^foo}bar{:else}foo{/foo}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.name(), 'foo');
			});
		});

		it('Should return the name of a conditional path', function() {
			[
				'{?foo.bar}{/foo.bar}',
				'{?foo.bar}foo.bar{:else}baz.quuz{/foo.bar}',
				'{^foo.bar}{/foo.bar}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.name(), 'foo.bar');
			});
		});

		it('Should return the name of a simple reference', function() {
			var node = new Node(compile('{ref}'));
			assert.strictEqual(node.name(), 'ref');
		});

		it('Should return the name of a reference using filters', function() {
			var node = new Node(compile('{ref|filter}'));
			assert.strictEqual(node.name(), 'ref');
		});

		it('Should return the name of a reference path', function() {
			var node = new Node(compile('{path.to.a.ref}'));
			assert.strictEqual(node.name(), 'path.to.a.ref');
		});

		it('Should return the name of a reference using array access with an integer', function() {
			var node = new Node(compile('{foo[1]}'));
			assert.strictEqual(node.name(), 'foo.1');
		});

		it('Should return the name of a reference using array access with `$idx`', function() {
			var node = new Node(compile('{foo[$idx]}'));
			assert.strictEqual(node.name(), 'foo.$idx');
		});

		it('Should return the name of a reference path using array access with `$idx`', function() {
			var node = new Node(compile('{foo.bar[$idx]}'));
			assert.strictEqual(node.name(), 'foo.bar.$idx');
		});

		it('Should return the name of a `.` reference', function() {
			var node = new Node(compile('{.}'));
			assert.strictEqual(node.name(), '.');
		});

		it('Should return null if the node has no name', function() {
			[
				'buffer',
				'{! comment !}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.name(), null);
			});
		});

	});

	describe('line', function() {
		it('Should return the line number', function() {
			var node = new Node(compile('{foo}'));
			assert.strictEqual(node.line(), 1);
		});
	});

	describe('column', function() {
		it('Should return the column number', function() {
			var node = new Node(compile('{foo}'));
			assert.strictEqual(node.column(), 1);
		});
	});

	describe('context', function() {
		it('Should return the context if one is available', function() {
			[
				'{#a:foo}{/a}',
				'{#a.b.c:foo}{/a.b.c}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.context(), 'foo');
			});
		});

		it('Should return `null` if there is no context', function() {
			[
				'{#foo}{/foo}',
				'{.}',
				'{?foo}{/foo}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.isNull(node.context());
			});
		});
	});

	describe('filters', function() {
		it('Should return an array of filters', function() {
			var node = new Node(compile('{foo|js|s}'));
			assert.deepEqual(node.filters(), ['js', 's']);
		});

		it('Should return an empty array if no filters were used', function() {
			var node = new Node(compile('{foo}'));
			assert.deepEqual(node.filters(), []);
		});
	});

	describe('params', function() {
		it('Should return an array of parameter names', function() {
			[
				'{#sec foo="bar" baz="quux"}{/sec}',
				'{@helper foo="bar" baz="quux"/}',
				'{#sec foo="{bar}" baz="abc{baz}"}{/sec}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.deepEqual(node.params(), ['foo', 'baz']);
			});
		});

		it('Should return an empty array if no parameters were used', function() {
			var node = new Node(compile('{#sec}{/sec}'));
			assert.deepEqual(node.params(), []);
		});
	});

	describe('countBodies', function() {
		it('Should return a count of the bodies in an node for nodes with a single body', function() {
			[
				'{#sec}foo{/sec}',
				'{@helper}foo{/helper}',
				'{?foo}foo{/foo}',
				'{@helper params="{foo}"}foo{/helper}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.countBodies(), 1);
			});
		});

		it('Should return a count of the bodies in a node for nodes with multiple bodies', function() {
			[
				'{?foo}foo{:else}bar{/foo}',
				'{@helper foo="{bar}"}foo{:else}bar{/helper}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.countBodies(), 2);
			});
		});

		it('Should return a count of the bodies in a node for nodes with no body', function() {
			[
				'{foo}',
				'{@helper foo="bar"/}'
			].forEach(function(template) {
				var node = new Node(compile(template));
				assert.strictEqual(node.countBodies(), 0);
			});
		});
	});
});
