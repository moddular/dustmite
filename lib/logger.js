
'use strict';

var logger = console;

module.exports = {
	set: function(log) {
		var required = [
			'log',
			'error'
		];

		if (typeof log !== 'object') {
			throw new Error('Logger must be an object');
		}
		for (var i = 0; required[i]; ++i) {
			if (typeof log[required[i]] !== 'function') {
				throw new Error('Logger must implement a ' + required[i] + ' method');
			}
		}

		logger = log;
		return logger;
	},
	get: function() {
		return logger;
	}
};
