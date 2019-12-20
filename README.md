# README


The splitweb plugin enables serving of read-only version of 
tiddlywiki from a generic web server.

# How to build

This was tested only under Linux and might not work on Windows system.

```
make clean 
TIDDLYWIKI_PATH=~/dev/tiddlywiki # update the path to point to correct location
make build
cd output/demo 
caddy file-server
```