export TIDDLYWIKI_PLUGIN_PATH := $(TIDDLYWIKI_PATH)/plugin/:plugins
export TW_TOOL := $(TIDDLYWIKI_PATH)/tiddlywiki.js

all: build

serve: build check-env
	@node $(TW_TOOL) editions/server --listen

.PHONY: build
build: check-env
	@node $(TW_TOOL) editions/demo --verbose \
		--output `pwd`/output --build splitweb

.PHONY: clean
clean:
	@rm -rf output

.PHONY: deploy
deploy: build site
	@cp -r output/demo/* site/
	@rm -rf output/demo/plugins/
	@cd site && git add -A .
	@cd site && git commit -m "Update `date --iso-8601=minutes`"

.PHONY: check-env
check-env:  __CHECK_ENV=1
check-env:
ifndef __CHECK_ENV
	@printf 'Checking environemnt....'
	@[ "${TIDDLYWIKI_PATH}" ] \
		|| ( printf "\n\t>>>>> TIDDLYWIKI_PATH var is not set\n" ; make error )
	@echo OK
endif

site:
	@git worktree add --track -b gh-pages $@ origin/gh-pages