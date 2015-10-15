#!/usr/bin/env node

'use strict';

var Validator = require('../lib/validator')();

var fs = require('fs');
var path = require('path');
var yargs = require('yargs');
var glob = require('glob');

var args = yargs.options('r', {
	alias: 'rules',
	type: 'string'
}).options('p', {
	alias: 'path',
	type: 'string',
	default: process.cwd()
}).options('e', {
	alias: 'extensions',
	type: 'string',
	default: 'dust'
}).describe({
	r: 'Path to a Javascript file exporting custom rule definitions',
	p: 'Path to lint. Can be an individual file or a directory that will be searched recursively for files with an extension matching the --extensions option',
	e: 'File extensions to use when linting a directory. Separate multiple extensions with a | character'
}).alias('h', 'help').help('help').alias('v', 'version').version(function() {
	return require('../package').version;
}).argv;

var getConfigFile = function(name) {
	try {
		return fs.readFileSync(path.join(process.cwd(), name), 'utf8');
	} catch (e) {
		return '';
	}
};

var getFileList = function(args) {
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
		console.error(e.message);
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
};

var getRuleList = function(args) {
	var defaults = require('../lib/rules');
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
			}
		});
	}
	return rules;
};

var files = getFileList(args);
var rules = getRuleList(args).reduce(function(acc, rule) {
	if (!acc[rule.type]) {
		acc[rule.type] = [];
	}
	acc[rule.type].push((rule.meta) ? {
		test: rule.test,
		meta: rule.meta
	} : rule.test);
	return acc;
}, {});


var validator = new Validator(files, rules);
var status = validator.run();

console.log(validator.report());

process.exit(status);
