
# Color helpers
C_CYAN=\x1b[34;01m
C_RESET=\x1b[0m

# Group targets
all: deps lint lcov-levels
ci: lint lcov-levels

# Install dependencies
deps:
	@echo "$(C_CYAN)> installing dependencies$(C_RESET)"
	@npm install

# Run all linters
lint: jshint jscs

# Lint JavaScript
jshint:
	@echo "$(C_CYAN)> linting javascript$(C_RESET)"
	@./node_modules/.bin/jshint .

# Run JavaScript Code Style
jscs:
	@echo "$(C_CYAN)> checking javascript code style$(C_RESET)"
	@./node_modules/.bin/jscs .

# Run all tests
test:
	@echo "$(C_CYAN)> running tests$(C_RESET)"
	@./node_modules/.bin/mocha --reporter spec --ui bdd ./test/lib

test-cov:
	@echo "$(C_CYAN)> checking test coverage$(C_RESET)"
	@./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- --reporter spec --ui bdd ./test/lib

lcov-levels: test-cov
	@echo "$(C_CYAN)> checking coverage levels$(C_RESET)"
	@./node_modules/.bin/istanbul check-coverage --statement 95 --branch 95 --function 95


.PHONY: test
