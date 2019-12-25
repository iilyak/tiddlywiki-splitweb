/*\
title: $:/plugins/iilyak/splitweb/commands/tiddlers.json.js
type: application/javascript
module-type: command

Command to save the current wiki as a wiki folder

--tiddlers.json <output_path> [split filter]

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.info = {
	name: "tiddlers.json",
	synchronous: true
};

var fs,path;
if($tw.node) {
	fs = require("fs");
	path = require("path");
}

var Command = function(params,commander) {
	this.params = params;
	this.commander = commander;
	this.wiki = commander.wiki;
};

Command.prototype.fileInfo = function(directory,tiddler) {
	return $tw.utils.generateTiddlerFileInfo(tiddler,{
		directory: path.resolve(this.wikiFolderPath,directory),		
		wiki: this.wiki
	});
};

Command.prototype.execute = function() {
    this.wikiFolderPath = this.params[0];
    this.wikiFilter = this.params[1] || "[all[tiddlers]]";
    var tiddlers = [],
        self = this;
    var tiddlerTitles = this.wiki.filterTiddlers(this.wikiFilter);

    this.wiki.forEachTiddler({sortField: "title"},function(title,tiddler) {
            var filepath = self.fileInfo(".", tiddler);
    		tiddlers.push(self.convertTiddlerToTiddlyWebFormat(filepath,tiddler));
    });

    var text = JSON.stringify(tiddlers,null,$tw.config.preferences.jsonSpaces);
    fs.writeFileSync(self.wikiFolderPath + path.sep + "tiddlers.json",text,"utf8");
	return null; // No error
};

Command.prototype.log = function(str) {
	if(this.commander.verbose) {
		console.log(str);
	}
};

/*
Convert a tiddler to a field set suitable for PUTting to TiddlyWeb and SplitWeb
*/
Command.prototype.convertTiddlerToTiddlyWebFormat = function(filepath,tiddler) {
    var filepath = this.fileInfo(".", tiddler).filepath;
    filepath = filepath.replace(path.resolve(this.wikiFolderPath) + path.sep, "tiddlers" + path.sep)

	var result = {},
		knownFields = [
			"bag", "created", "creator", "modified", "modifier", "permissions", "recipe", "revision", "tags", "text", "title", "type", "uri"
		];
	if(tiddler) {
		$tw.utils.each(tiddler.fields,function(fieldValue,fieldName) {
			var fieldString = fieldName === "tags" ?
								tiddler.fields.tags :
								tiddler.getFieldString(fieldName); // Tags must be passed as an array, not a string

			if(knownFields.indexOf(fieldName) !== -1) {
				// If it's a known field, just copy it across
				result[fieldName] = fieldString;
			} else {
				// If it's unknown, put it in the "fields" field
				result.fields = result.fields || {};
				result.fields[fieldName] = fieldString;
			}
		});
	}
	// Default the content type
	result.type = result.type || "text/vnd.tiddlywiki";
	result.filepath = filepath;
	delete result.text;
	return result;
};


exports.Command = Command;

})();

