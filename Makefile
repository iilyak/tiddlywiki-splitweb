export TIDDLYWIKI_PLUGIN_PATH := $(TIDDLYWIKI_PATH)/plugin/:plugins
export TW_TOOL := $(TIDDLYWIKI_PATH)/tiddlywiki.js

all: build

serve: build
	@node $(TW_TOOL) editions/server --listen

.PHONY: build
build: 
	@node $(TW_TOOL) editions/demo --verbose \
		--output `pwd`/output --build splitweb

.PHONY: clean
clean:
	@rm -rf output

