
'use strict';

var Node = function(node, stack) {
	this.node = node;
	this.stack = stack || [];
	this.type = node[0];
};

Node.prototype.name = function() {
	var name;

	if (this.type === 'special') {
		return this.node[1];
	}

	name = this.extract('key');
	if (name) {
		return name;
	}

	name = this.extract('path', {
		asArray: true
	});

	if (name && name.length) {
		return name[1].length ? name[1].map(function(part) {
			if (Array.isArray(part) && part.length > 1) {
				return part[1];
			}
			return part;
		}.bind(this)).join('.') : '.';
	}
	return null;
};

Node.prototype.line = function() {
	return this.extract('line');
};

Node.prototype.column = function() {
	return this.extract('col');
};

Node.prototype.context = function() {
	var context = this.extract('context');
	if (context && Array.isArray(context) && context.length > 1) {
		return context[1];
	}
	return null;
};

Node.prototype.filters = function() {
	return this.extract('filters', {
		asArray: true
	});
};

Node.prototype.params = function() {
	var params = this.extract('params', {
		asArray: true
	});
	return params.map(function(param) {
		return param[1][1];
	});
};

Node.prototype.countBodies = function() {
	return this.extract('bodies', {
		asArray: true
	}).length;
};

Node.prototype.extract = function(key, options) {
	options = options || {};

	var node = options.node || this.node;
	var item = node.filter(function(item) {
		return Array.isArray(item) && item[0] === key;
	});
	if (item.length && item[0].length > 1) {
		return (options.asArray) ? item[0].slice(1) : item[0][1];
	}
	return (options.asArray) ? [] : null;
};

module.exports = Node;
