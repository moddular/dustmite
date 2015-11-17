
'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var logger = require('./logger').get();

var getConfigFile = function(name) {
	try {
		return fs.readFileSync(path.join(process.cwd(), name), 'utf8');
	} catch (e) {
		return '';
	}
};

module.exports = {
	getFiles: function(args) {
		var files = [];
		var stat = null;
		var ignore = getConfigFile('.dustmiteignore').split('\n').map(function(line) {
			return line.replace(/^\s+/, '').replace(/\s+$/, '');
		}).filter(function(line) {
			return line.length > 0;
		});

		try {
			stat = fs.lstatSync(args.path);
		} catch (e) {
			logger.error(e.message);
		}

		if (stat) {
			if (stat.isDirectory()) {
				files = glob.sync(args.path + '/**/*.' + args.extensions);
			} else if (stat.isFile()) {
				files = [args.path];
			}
		}
		return files.filter(function(file) {
			for (var i = 0; ignore[i]; ++i) {
				if (file.indexOf(ignore[i]) !== -1) {
					return false;
				}
			}
			return true;
		}).map(function(file) {
			return path.resolve(file);
		});
	},

	getRules: function(args) {
		var defaults = require('./rules');
		var config = getConfigFile('.dustmiterc');
		var rules = [];

		if (args.rules) {
			rules = require(path.resolve(args.rules));
		}

		if (config !== '') {
			config = JSON.parse(config);

			Object.keys(config).forEach(function(key) {
				if (config[key] && defaults[key]) {
					if (typeof config[key] !== 'boolean') {
						defaults[key].meta = config[key];
					}
					rules.push(defaults[key]);
				} else if (!defaults[key]) {
					logger.error('Unknown dustmite rule: ' + key);
				}
			});
		}

		return rules.reduce(function(acc, rule) {
			var types = (Array.isArray(rule.type)) ? rule.type : [rule.type];
			types.forEach(function(type) {
				if (!acc[type]) {
					acc[type] = [];
				}
				acc[type].push((rule.meta) ? {
					test: rule.test,
					meta: rule.meta
				} : rule.test);
			});
			return acc;
		}, {});
	}
};
