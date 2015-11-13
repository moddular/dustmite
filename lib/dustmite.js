
'use strict';

module.exports = function() {
	return require('./validator').apply(null, [].slice.call(arguments, 0));
};
module.exports.Reporter = require('./reporter');
module.exports.Parser = require('./parser');
module.exports.Node = require('./node');
module.exports.Rules = require('./rules');
module.exports.Cli = require('./cli');
module.exports.Logger = require('./logger');
