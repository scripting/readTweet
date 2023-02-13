const appConsts = {
	urlTwitterServer: "//readtweet.scripting.com/"
	};

function httpRequest (url, timeout, headers, callback) { 
	timeout = (timeout === undefined) ? 30000 : timeout;
	var jxhr = $.ajax ({ 
		url: url,
		dataType: "text", 
		headers,
		timeout
		}) 
	.success (function (data, status) { 
		callback (undefined, data);
		}) 
	.error (function (status) { 
		var message;
		try { //9/18/21 by DW
			message = JSON.parse (status.responseText).message;
			}
		catch (err) {
			message = status.responseText;
			}
		if ((message === undefined) || (message.length == 0)) { //7/22/22 by DW & 8/31/22 by DW
			message = "There was an error communicating with the server.";
			}
		var err = {
			code: status.status,
			message
			};
		callback (err);
		});
	}
function buildParamList (paramtable, flPrivate) { //8/4/21 by DW
	var s = "";
	if (flPrivate) {
		paramtable.flprivate = "true";
		}
	for (var x in paramtable) {
		if (paramtable [x] !== undefined) { //8/4/21 by DW
			if (s.length > 0) {
				s += "&";
				}
			s += x + "=" + encodeURIComponent (paramtable [x]);
			}
		}
	return (s);
	}
function servercall (path, params, flAuthenticated, callback, urlServer=appConsts.urlTwitterServer) {
	var whenstart = new Date ();
	if (params === undefined) {
		params = new Object ();
		}
	if (flAuthenticated) { //1/11/21 by DW
		if (localStorage.twOauthToken !== undefined) { //12/23/22 by DW
			params.oauth_token = localStorage.twOauthToken;
			params.oauth_token_secret = localStorage.twOauthTokenSecret;
			}
		addEmailParams (params); //12/13/22 by DW
		}
	var url = urlServer + path + "?" + buildParamList (params, false);
	httpRequest (url, undefined, undefined, function (err, jsontext) {
		if (err) {
			console.log ("servercall: url == " + url + ", err.message == " + err.message);
			callback (err);
			}
		else {
			callback (undefined, JSON.parse (jsontext));
			}
		});
	}
function getEmailAddressFromTweet (urltweet, callback) { //12/7/22 by DW
	servercall ("getemailaddressfromtweet", {urltweet}, false, callback);
	}
function clickGoButton () {
	console.log ("clickGoButton");
	$("#idGoButton").blur ();
	var urlTweet = trimWhitespace ($("#idUrlTweet").val ());
	if (urlTweet.length == 0) {
		speakerBeep ();
		}
	else {
		console.log ("clickGoButton: urlTweet == " + urlTweet);
		getEmailAddressFromTweet (urlTweet, function (err, data) {
			if (err) {
				alertDialog (err.message);
				}
			else {
				alertDialog ("According to <a href=\"" + urlTweet + "\" target=\"_blank\">the tweet</a>, your email address is: <br><br><i>" + data.theText + ".</i><br><br>If this is correct, you can delete the tweet. If not, please try again.");
				}
			});
		}
	
	}
function startup () {
	console.log ("startup");
	}
