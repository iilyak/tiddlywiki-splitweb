# README


The splitweb plugin enables serving of read-only version of 
tiddlywiki from a generic web server.

# Demo

* You can see a [demo here](https://iilyak.github.io/tiddlywiki-splitweb/)
* Direct [link to plugin](https://iilyak.github.io/tiddlywiki-splitweb/#%24%3A%2Fplugins%2Fiilyak%2Fsplitweb)

# How to build

This was tested only under Linux and might not work on Windows system.

```
make clean 
TIDDLYWIKI_PATH=~/dev/tiddlywiki # update the path to point to correct location
make build
cd output/demo 
caddy file-server
```

# Hosting on github pages

By dafault github uses jerkill preprocessing on gh-pages. You have to disable it by creating empty `.nojekyll` file at the root of the web site.
Otherwise the files which name starts with `_` (which is `/` in tiddler name) wouldn't be displayed.

## Deploying to github pages

```
make clean
TIDDLYWIKI_PATH=~/dev/tiddlywiki # update the path to point to correct location
make deploy
cd site
git push origin gh-pages
```

# Github Actions

TODO
