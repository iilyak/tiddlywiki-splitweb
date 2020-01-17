export TIDDLYWIKI_PLUGIN_PATH := $(TIDDLYWIKI_PATH)/plugin/:plugins
export TW_TOOL := $(TIDDLYWIKI_PATH)/tiddlywiki.js
export GITHUB_HOST ?= github.com
export GITHUB_SHA ?= $(shell git rev-parse HEAD)
REGEXP := "s|.*$$GITHUB_HOST[:/]\([^/]*/[^/]*\).*.git$$|\1|"
export GITHUB_REPOSITORY ?= $(shell git remote get-url origin | sed -e $(REGEXP))

all: build

.PHONY: help
# target: help - Prints this help
help:
	@egrep "^# target:" Makefile | sed -e 's/^# target: //g' | sort

.PHONY: serve
# target: serve - start nodejs edition to simplify updates
serve: build check-env
	@node $(TW_TOOL) editions/server --listen

.PHONY: build
# target: build - compile site content
build: check-env
	@node $(TW_TOOL) editions/demo --verbose \
		--output `pwd`/output --build splitweb

.PHONY: clean
# target: clean - cleanup build artifacts
clean:
	@rm -rf output

.PHONY: caddy
# target: caddy - compile site content and start web server
caddy: build
	@cd output/demo && caddy file-server

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