
'use strict';

module.exports = function() {
	return require('./validator');
};
module.exports.Reporter = require('./reporter');
module.exports.Parser = require('./parser');
module.exports.Node = require('./node');
module.exports.Rules = require('./rules');
