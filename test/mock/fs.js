
'use strict';

var sinon = require('sinon');

module.exports = {
	readFileSync: sinon.stub(),
	lstatSync: sinon.stub().returns({
		isFile: sinon.stub(),
		isDirectory: sinon.stub()
	})
};
