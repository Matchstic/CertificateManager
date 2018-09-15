var MYACINFO = "";
var TEAMID = "";

const request = require('superagent');
var plist = require('plist');

// From: https://stackoverflow.com/a/105074
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function urlEncode(string) {
	// TODO: Check if needed?
	return string;
}

function _dictionaryToPlist(dictionary) {
	return plist.build(dictionary)
}

function _doActionWithName(action, systemType, extra, callback) {
	data = {
			clientId: 'XABBG36SBA',
			myacinfo: MYACINFO,
			protocolVersion: 'QH65B2',
			requestId: guid(),
			userLocal: ['en_US'],
	};
	
	// Add contents of extra to data.
    data = Object.assign({}, data, extra);
	
	plistData = _dictionaryToPlist(data);
	
  	request
    	.post('https://developerservices2.apple.com/services/QH65B2/' + systemType + '/' + action + '?clientId=XABBG36SBA')
    	.send(plistData)
    	.set('Cookie', "myacinfo=" + MYACINFO)
		.set('User-Agent', 'Xcode')
		.set("X-Xcode-Version", '7.0 (7A120f)')
		.set("Accept-Language", 'en-us')
		.set("Content-Type", 'text/x-xml-plist')
		.set("Accept", 'text/x-xml-plist')
    	.end((err, res) => {
			console.info(res);
    		callback(plist.parse(res["text"]));
    });
}

function _signIn(username, password, callback) {
	$.ajax({
	    url: 'https://idmsa.apple.com/IDMSWebAuth/clientDAW.cgi',
	    type: 'post',
	    data: {
			appIdKey: 'ba2ec180e6ca6e6c6a542255453b24d6e6e5b2be0cc48bc1b0d8ad64cfe0228f',
			userLocale: 'en_US',
			protocolVersion: 'A1234',
			appleId: urlEncode(username),
			password: urlEncode(password),
			format: 'json'
	    },
	    headers: {
	        "Accept": 'application/json',
	        "Accept-Language": 'en-us',
			"Content-Type": 'application/x-www-form-urlencoded',
			"User-Agent": 'Xcode',
	    },
	    dataType: 'json',
	    success: function (data) {
			callback(data);
	    }
	});
}

function AppleServices_signIn(username, password, callback) {
	_signIn(username, password, function(data) {
		// Parse response.
		
		reason = "";
		userString = data["userString"]
		
		if (userString == "") {
			reason = "authenticated";
			
			// Handle myacinfo - used for authentication
			MYACINFO = data["myacinfo"];
		} else if (data["resultCode"] == "-22938") {
			reason = "appSpecificRequired";
		} else if (data["resultCode"] == "-20101" ||
				   data["resultCode"] == "-1") {
					   reason = "incorrectCredentials";
		} else {
			reason = "unknown";
		}
		
		output = {
			userString: userString,
			reason: reason
		};
		
		callback(output);
	});
}

function AppleServices_setTeamID(teamId) {
	TEAMID = teamId;
}

function AppleServices_listTeams(callback) {
	data = {
			clientId: 'XABBG36SBA',
			myacinfo: MYACINFO,
			protocolVersion: 'QH65B2',
			requestId: guid(),
			userLocal: ['en_US'],
	};
	plistData = _dictionaryToPlist(data);
	
  	request
    	.post('https://developerservices2.apple.com/services/QH65B2/listTeams.action?clientId=XABBG36SBA')
    	.send(plistData)
    	.set('Cookie', "myacinfo=" + MYACINFO)
		.set('User-Agent', 'Xcode')
		.set("X-Xcode-Version", '7.0 (7A120f)')
		.set("Accept-Language", 'en-us')
		.set("Content-Type", 'text/x-xml-plist')
		.set("Accept", 'text/x-xml-plist')
    	.end((err, res) => {
    		callback(plist.parse(res["text"]));
    });
}

function AppleServices_listAllDevelopmentCertificates(teamId, callback) {
    extra = {
        teamId: teamId,
    };
    
    _doActionWithName("listAllDevelopmentCerts.action", "ios", extra, function(result) {
        callback(result);
    });
}

function AppleServices_revokeDevelopmentCertificate(certificateSerialNumber, teamId, callback) {
    extra = {
        teamId: teamId,
        serialNumber: certificateSerialNumber,
    };
    
    _doActionWithName("revokeDevelopmentCert.action", "ios", extra, function(result) {
        callback(result);
    });
}