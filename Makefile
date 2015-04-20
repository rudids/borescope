TAPE = ./node_modules/.bin/tape
TAP-SPEC = ./node_modules/.bin/tap-spec

test:
	$(TAPE) ./test/*.js | $(TAP-SPEC)

.PHONY: test