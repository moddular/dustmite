
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var path = require('path');
var sinon = require('sinon');

describe('lib/validator', function() {
	var Validator;
	var fs;

	before(function() {
		fs = {
			readFileSync: sinon.stub()
		};
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		mockery.registerMock('fs', fs);

		Validator = require(path.join(__dirname, '..', '..', 'lib', 'validator'));
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('read', function() {
		it('Should synchronously read a file', function() {
			var validator = new Validator();
			validator.read('foo.dust');

			assert.isTrue(fs.readFileSync.calledOnce);
			assert.isTrue(fs.readFileSync.calledWith('foo.dust', 'utf8'));
		});
	});

	describe('validate', function() {
		var rules;

		beforeEach(function() {
			rules = {
				reference: [sinon.stub()],
				special: [sinon.stub()]
			};
		});

		it('Should trigger reference validations when it encounters a reference in the template', function() {
			var validator = new Validator(['valid.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('valid.dust').returns('{foo}');
			validator.validate(0, 'valid.dust');
			assert.isTrue(rules.reference[0].calledOnce);
			assert.isTrue(rules.special[0].notCalled);
		});

		it('Should trigger special validations when it encounters as special character in the template', function() {
			var validator = new Validator(['valid.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('valid.dust').returns('{~s}');
			validator.validate(0, 'valid.dust');
			assert.isTrue(rules.reference[0].notCalled);
			assert.isTrue(rules.special[0].calledOnce);
		});

		it('Should return 0 if there was no error', function() {
			var validator = new Validator(['valid.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('valid.dust').returns('{~s}');
			var result = validator.validate(0, 'valid.dust');
			assert.strictEqual(result, 0);
		});

		it('Should return 1 if there was an error', function() {
			var validator = new Validator(['invalid.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('invalid.dust').returns('{~foo}');
			rules.special[0].callsArg(0);
			var result = validator.validate(0, 'invalid.dust');
			assert.strictEqual(result, 1);
		});

		it('Should track the error state in it\'s first parameter', function() {
			var validator = new Validator(['valid.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('valid.dust').returns('{~s}');
			var result = validator.validate(1, 'valid.dust');
			assert.strictEqual(result, 1);
		});

		it('Should count the total errors', function() {
			var validator = new Validator(['invalid.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('invalid.dust').returns('{~foo}{_bar}');
			rules.special[0].callsArg(0);
			rules.reference[0].callsArg(0);
			assert.strictEqual(validator.total, 0);
			validator.validate(0, 'invalid.dust');
			assert.strictEqual(validator.total, 2);
		});

		it('Should count the files validated', function() {
			var validator = new Validator(['valid1.dust', 'valid2.dust'], rules, sinon.stub());
			fs.readFileSync.withArgs('valid1.dust').returns('{foo}');
			fs.readFileSync.withArgs('valid2.dust').returns('{~s}');
			assert.strictEqual(validator.tested, 0);
			validator.validate(0, 'valid1.dust');
			assert.strictEqual(validator.tested, 1);
			validator.validate(0, 'valid2.dust');
			assert.strictEqual(validator.tested, 2);
		});

		it('Should not print a report if there were no errors', function() {
			var log = sinon.stub();
			var validator = new Validator(['valid.dust'], rules, log);
			fs.readFileSync.withArgs('valid.dust').returns('{foo}');
			validator.validate(0, 'valid.dust');
			assert.isTrue(log.notCalled);
		});

		it('Should print a report if there were errors', function() {
			var log = sinon.stub();
			var validator = new Validator(['invalid.dust'], rules, log);
			fs.readFileSync.withArgs('invalid.dust').returns('{~foo}');
			rules.special[0].callsArg(0);
			validator.validate(0, 'invalid.dust');
			assert.isTrue(log.calledOnce);
		});
	});

	describe('report', function() {
		it('Should report no files processed and no errors before validation has run', function() {
			var validator = new Validator(['invalid.dust'], {}, sinon.stub());
			fs.readFileSync.withArgs('invalid.dust').returns('{#foo}foo{foo}');
			assert.include(validator.report(), '0 files tested, 0 errors found');
		});

		it('Should report the number of files processed and the error count after validation has run and found errors', function() {
			var validator = new Validator(['invalid.dust'], {}, sinon.stub());
			fs.readFileSync.withArgs('invalid.dust').returns('{#foo}foo{foo}');
			validator.run();
			assert.include(validator.report(), '1 files tested, 1 errors found');
		});

		it('Should report the number of files processed and a zero error count after validation has run and found no errors', function() {
			var validator = new Validator(['valid.dust'], {}, sinon.stub());
			fs.readFileSync.withArgs('valid.dust').returns('{#foo}foo{/foo}');
			validator.run();
			assert.include(validator.report(), '1 files tested, 0 errors found');
		});
	});

	describe('run', function() {
		it('Should call `validate` on each file', function() {
			var validator = new Validator(['a.dust', 'b.dust', 'c.dust'], {}, sinon.stub());
			var validate = sinon.stub(validator, 'validate');

			validator.run();
			assert.isTrue(validate.calledThrice);
			assert.isTrue(validate.calledOn(validator));
		});

		it('Should return 0 if all the validations pass', function() {
			var validator = new Validator(['a.dust', 'b.dust', 'c.dust'], {}, sinon.stub());
			sinon.stub(validator, 'validate').returns(0);
			var result = validator.run();
			assert.strictEqual(result, 0);
		});

		it('Should return 1 if any of the validations fail', function() {
			var validator = new Validator(['a.dust', 'b.dust', 'c.dust'], {}, sinon.stub());
			var validate = sinon.stub(validator, 'validate');

			validate.withArgs(0, 'a.dust').returns(0);
			validate.withArgs(0, 'b.dust').returns(1);
			validate.withArgs(1, 'c.dust').returns(1);

			var result = validator.run();
			assert.strictEqual(result, 1);
		});
	});
});
