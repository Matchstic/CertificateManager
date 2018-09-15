function _do_signin(username, password) {
	// Push to AppleServices.js
	$("#login-main-input").css("display", "none");
    $("#login-2fa-input").css("display", "none");
    $("#login-subtitle").css("display", "none");
	$("#login-spinner").css("display", "block");
	
	AppleServices_signIn(username, password, function(output) {
		if (output["reason"] == "authenticated") {
			// TODO: Switch UI to showing the certificates
			// But first, check for Team IDs
			_check_team_ids();
		} else {
			// Check failure reason - may need to cache username for 2FA (and show UI as appropriate)
			if (output["reason"] == "appSpecificRequired") {
				$("#login-main-input").css("display", "none");
				$("#login-2fa-input").css("display", "block");
                $("#login-subtitle").css("display", "block");
                $("#login-spinner").css("display", "none");
			}
			
			// Show error
			$("#login-error").css("display", "block");
            $("#login-main-input").css("display", "block");
			$("#login-error").text(output["userString"]);
			
			$("#login-subtitle").css("display", "block");
			$("#login-spinner").css("display", "none");
		}
	});
}

function login_no_2fa_submit() {
	// Get the value of the username and password fields
	username = document.getElementById('login-username').value;
	password = document.getElementById('login-password').value;
	
	_do_signin(username, password);
	
	return false;
}

function login_2fa_submit() {
	// Get the value of the password field, and use the cached username
	username = document.getElementById('login-username').value;
	password = document.getElementById('login-2fa-password').value;
	
	_do_signin(username, password);
	
	return false;
}

function _check_team_ids() {
	AppleServices_listTeams(function(output) {
		
		if (output["resultCode"] != 0) {
			// TODO: Handle error
            alert("Failed to list Team IDs associated with this account.")
		} else {
			teams = output["teams"];
			
			if (teams.length > 1) {
				// TODO: Display Team ID picker
                alert("Accounts with multiple possible Team IDs are not yet supported.")
			} else {
				// Set the current Team ID into AppleServices
				teamId = teams[0]["teamId"];
				AppleServices_setTeamID(teamId);
				
				console.log("Set team ID: " + teamId);
				
				// And now show the certificates UI
				_showCertificatesPanel(teamId);
			}
		}
	});
}

function _showCertificatesPanel(teamId) {
	// TODO: Toggle visibility?
    
	// TODO: Start the certificate fetch from remote.
    downloadCertificates(teamId);
}