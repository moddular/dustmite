
'use strict';

var sinon = require('sinon');

module.exports = {
	get: sinon.stub().returns({
		error: sinon.stub(),
		log: sinon.stub()
	}),
	set: sinon.stub().returnsArg(0)
};
