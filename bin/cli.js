#!/usr/bin/env node

'use strict';

var dustmite = require('../');
var cli = dustmite.Cli;
var Validator = dustmite();

var yargs = require('yargs');

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

var validator = new Validator(cli.getFiles(args), cli.getRules(args));
var status = validator.run();
validator.log();

process.exit(status);
