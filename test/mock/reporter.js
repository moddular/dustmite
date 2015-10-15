
'use strict';

var sinon = require('sinon');

module.exports = sinon.stub().returns({
	add: sinon.stub(),
	format: sinon.stub(),
	status: sinon.stub().returns(0),
	count: sinon.stub().returns(0)
});
