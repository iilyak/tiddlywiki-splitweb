/*\
title: $:/plugins/iilyak/splitweb/adaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for fetching tiddlers from static web server

Note about implementation

I hoped I could use `skinnyTiddler = self.wiki.getTiddler(title);` 
in loadTiddler function. Unfortunatelly it looks like the 
$tw.Tiddler instance representing skinnyTiddler explicitelly dropping
all fields.

Due to this I need to implement additional storage
`

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var CONFIG_HOST_TIDDLER = "$:/config/splitweb/host",
	DEFAULT_HOST_TIDDLER = "$protocol$//$host$/";

function SplitWebAdaptor(options) {
	this.wiki = options.wiki;
	this.host = this.getHost();
	this.recipe = undefined;
	this.hasStatus = false;
	this.logger = new $tw.utils.Logger("SplitWebAdaptor");
	this.isLoggedIn = false;
	this.isReadOnly = true;
	this.skinny = {};
}

SplitWebAdaptor.prototype.name = "split";

SplitWebAdaptor.prototype.isReady = function() {
	return this.hasStatus;
};

SplitWebAdaptor.prototype.getHost = function() {
	var text = this.wiki.getTiddlerText(CONFIG_HOST_TIDDLER,DEFAULT_HOST_TIDDLER),
		substitutions = [
			{name: "protocol", value: document.location.protocol},
			{name: "host", value: document.location.host}
		];
	for(var t=0; t<substitutions.length; t++) {
		var s = substitutions[t];
		text = $tw.utils.replaceString(text,new RegExp("\\$" + s.name + "\\$","mg"),s.value);
	}
	return text;
};

SplitWebAdaptor.prototype.getTiddlerInfo = function(tiddler) {
	return {
		bag: tiddler.fields.bag
	};
};

/*
Get the current status of the TiddlyWeb connection
*/
SplitWebAdaptor.prototype.getStatus = function(callback) {
	var self = this;
	self.isLoggedIn = false;
	self.isReadOnly = true;
	self.isAnonymous = true;
	self.hasStatus = true;
	// Invoke the callback if present
	if(callback) {
		callback(null,self.isLoggedIn,"UNAUTHENTICATED",self.isReadOnly,self.isAnonymous);
	}
};

/*
Attempt to login and invoke the callback(err)
*/
SplitWebAdaptor.prototype.login = function(username,password,callback) {
	if(callback) {
		callback(null);
	};
};

/*
*/
SplitWebAdaptor.prototype.logout = function(callback) {
	if(callback) {
		callback(null);
	};
};

/*
Get an array of skinny tiddler fields from the server
*/
SplitWebAdaptor.prototype.getSkinnyTiddlers = function(callback) {
	var self = this;
	$tw.utils.httpRequest({
		url: this.host + "tiddlers.json",
		callback: function(err,data) {
			// Check for errors
			if(err) {
				return callback(err);
			}
			// Process the tiddlers to make sure the revision is a string
			var tiddlers = JSON.parse(data);
			var currentTiddler, titleDigest;
			for(var t=0; t<tiddlers.length; t++) {
			    currentTiddler = tiddlers[t];
                self.skinny[self.titleDigest(currentTiddler.title)] = currentTiddler;
				tiddlers[t] = self.convertTiddlerFromTiddlyWebFormat(currentTiddler);
			}
			// Invoke the callback with the skinny tiddlers
			callback(null,tiddlers);
		}
	});
};

/*
Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
*/
SplitWebAdaptor.prototype.saveTiddler = function(tiddler,callback) {
	return callback(null);
};

SplitWebAdaptor.prototype.titleDigest = function(title) {
    var bitArray = sjcl.hash.sha256.hash(title);
	return sjcl.codec.hex.fromBits(bitArray);
};

/*
Load a tiddler and invoke the callback with (err,tiddlerFields)
*/
SplitWebAdaptor.prototype.loadTiddler = function(title,callback) {
	var self = this,
	    fields = self.skinny[self.titleDigest(title)],
	    type = null;
    if(fields.type === "text/vnd.tiddlywiki") {
	    fields.type = "application/x-tiddler";
	}
	        
	delete self.skinny[self.titleDigest(title)];
	
	$tw.utils.httpRequest({
		url: this.host + fields.filepath,
		callback: function(err,data,request) {
			if(err) {
				return callback(err);
			}
			// Invoke the callback
			var tiddlerFields = $tw.wiki.deserializeTiddlers(fields.type, data, fields, {})[0];
			delete tiddlerFields.filepath;
			callback(null,self.convertTiddlerFromTiddlyWebFormat(tiddlerFields));
		}
	});
};

/*
Delete a tiddler and invoke the callback with (err)
options include:
tiddlerInfo: the syncer's tiddlerInfo for this tiddler
*/
SplitWebAdaptor.prototype.deleteTiddler = function(title,callback,options) {
	return callback(null);
};

/*
Convert a field set in TiddlyWeb format into ordinary TiddlyWiki5 format
*/
SplitWebAdaptor.prototype.convertTiddlerFromTiddlyWebFormat = function(tiddlerFields) {
	var self = this,
		result = {};
	// Transfer the fields, pulling down the `fields` hashmap
	$tw.utils.each(tiddlerFields,function(element,title,object) {
		if(title === "fields") {
			$tw.utils.each(element,function(element,subTitle,object) {
				result[subTitle] = element;
			});
		} else {
			result[title] = tiddlerFields[title];
		}
	});
	// Make sure the revision is expressed as a string
	if(typeof result.revision === "number") {
		result.revision = result.revision.toString();
	}
	// Some unholy freaking of content types
	if(result.type === "text/javascript") {
		result.type = "application/javascript";
	} else if(!result.type || result.type === "None") {
		result.type = "text/x-tiddlywiki";
	}
	return result;
};

if($tw.browser && document.location.protocol.substr(0,4) === "http" ) {
	exports.adaptorClass = SplitWebAdaptor;
}

})();
