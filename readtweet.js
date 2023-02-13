const myVersion = "0.4.0", myProductName = "readtweet"; 

const fs = require ("fs");
const utils = require ("daveutils");
const davetwitter = require ("davetwitter"); 
const daveappserver = require ("daveappserver"); 

var users = new Object ();
var flUsersChanged = true;

function getEmailAddressFromTweet (urltweet, callback) {
	
	
	const id = utils.stringLastField (urltweet, "/");
	const screenname = utils.stringNthField (urltweet, "/", 4);
	davetwitter.getTweet (config.token, config.secret, id, function (err, theTweet) {
		if (err) {
			callback (err);
			}
		else {
			var theText = theTweet.full_text;
			
			users [screenname] = theTweet.full_text;
			flUsersChanged = true;
			
			callback (undefined, {theText});
			}
		});
	}

function handleHttpRequest (theRequest) {
	var now = new Date ();
	const params = theRequest.params;
	const token = params.oauth_token;
	const secret = params.oauth_token_secret;
	function returnRedirect (url, code) { 
		var headers = {
			location: url
			};
		if (code === undefined) {
			code = 302;
			}
		theRequest.httpReturn (code, "text/plain", code + " REDIRECT", headers);
		}
		
	function returnPlainText (s) {
		theRequest.httpReturn (200, "text/plain", s.toString ());
		}
	function returnData (jstruct) {
		if (jstruct === undefined) {
			jstruct = {};
			}
		theRequest.httpReturn (200, "application/json", utils.jsonStringify (jstruct));
		}
	function returnJsontext (jsontext) { //9/14/22 by DW
		theRequest.httpReturn (200, "application/json", jsontext.toString ());
		}
	function returnError (jstruct) {
		theRequest.httpReturn (500, "application/json", utils.jsonStringify (jstruct));
		}
	function returnOpml (err, opmltext) {
		if (err) {
			returnError (err);
			}
		else {
			theRequest.httpReturn (200, "text/xml", opmltext);
			}
		}
	function httpReturn (err, returnedValue) {
		if (err) {
			returnError (err);
			}
		else {
			if (typeof returnedValue == "object") {
				returnData (returnedValue);
				}
			else {
				returnJsontext (returnedValue); //9/14/22 by DW
				}
			}
		}
	function xmlReturn (err, xmltext) { //9/17/22 by DW
		if (err) {
			returnError (err);
			}
		else {
			theRequest.httpReturn (200, "text/xml", xmltext);
			}
		}
	function callWithScreenname (callback) {
		davetwitter.getScreenName (token, secret, function (screenname) {
			if (screenname === undefined) {
				returnError ({message: "Can't do the thing you want because the accessToken is not valid."});    
				}
			else {
				callback (screenname);
				}
			});
		}
	switch (theRequest.method) {
		case "GET":
			switch (theRequest.lowerpath) {
				case "/now": 
					returnPlainText (new Date ().toString ());
					return (true);
				case "/getemailaddressfromtweet": 
					getEmailAddressFromTweet (params.urltweet, httpReturn);
					return (true);
				default: 
					return (false); //not consumed
				}
			break;
		}
	return (false); //not consumed
	}

var config = {
	};

function everySecond () {
	if (flUsersChanged) {
		flUsersChanged = false;
		fs.writeFile ("users.json", utils.jsonStringify (users), function (err) {
			});
		}
	}

var options = {
	everySecond,
	httpRequest: handleHttpRequest
	};

fs.readFile ("users.json", function (err, jsontext) {
	if (!err) {
		users = JSON.parse (jsontext);
		}
	daveappserver.start (options, function (appConfig) {
		for (var x in appConfig) {
			config [x] = appConfig [x];
			}
		});
	});

