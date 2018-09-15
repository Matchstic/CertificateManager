var CURRENT_TEAM_ID = "";
var CERTIFICATE_SERIALS = [];

function certificates_revoke_all() {
    return false;
}

function certificates_revoke(certificateSerialNumber) {
	$("#certificates-container").css("display", "none");
	$("#certificates-spinner").css("display", "block");
    
    AppleServices_revokeDevelopmentCertificate(certificateSerialNumber, CURRENT_TEAM_ID, function(output) {
        console.log(output);
        
        if (output["resultCode"] != 0) {
            alert("Error revoking certificate!");
            
        	$("#certificates-container").css("display", "block");
        	$("#certificates-spinner").css("display", "none");
        } else {
            // Re-download certificates if successful.
            downloadCertificates(CURRENT_TEAM_ID);
        }
    })
}

function downloadCertificates(teamId) {
    AppleServices_listAllDevelopmentCertificates(teamId, function(output) {
        if (output["resultCode"] != 0) {
            alert("Error downloading certificates!");
        } else {
            CURRENT_TEAM_ID = teamId;
            onCertificatesDownloaded(output["certificates"]);
            
            // Handle UI state
        	$("#certificates-container").css("display", "block");
        	$("#certificates-spinner").css("display", "none");
        }
        console.log(output);
    })
}

function onCertificatesDownloaded(certificates) {
    // Load UI contents
    
    CERTIFICATE_SERIALS = [];
    
    // Reset container if needed.
    var container = document.getElementById("certificates-container");
    while (container.hasChildNodes()) {  
        container.removeChild(container.firstChild);
    }
    
    // Handle case of if there's no certificates.
    if (certificates.length == 0) {
        
        var node = document.createElement("li"); 
        node.className = "certificates-item";
        
        // INNER
        var inner = document.createElement("div")
        inner.className = "certificates-item-inner";
        
        // INNER INNER (?!)
        var inner2 = document.createElement("div")
        
        var titleNode = document.createElement("p"); 
        titleNode.className = "certificates-item-nocerts";
        titleNode.innerText = "No Certificates";
        
        inner2.appendChild(titleNode);
        
        inner.appendChild(inner2);
        node.appendChild(inner);
        // END INFO
        
        container.appendChild(node);
        
        $("#login-ui").css("display", "none");
    	$("#certificates-ui").css("display", "block");
        
        return;
    }
    
    for (var index = 0; index < certificates.length; ++index) {
        var item = certificates[index];
        
        var machineName = item.machineName.replace("RPV- ", "");
        var applicationName = "Xcode";
        
        if (item.machineName.includes("RPV")) {
            applicationName = "ReProvision";
        } else if (item.machineName.includes("Cydia")) {
            applicationName = "Cydia Impactor or Extender";
        } 
        
        var node = document.createElement("li"); 
        node.className = "certificates-item";
        
        // INNER
        var inner = document.createElement("div")
        inner.className = "certificates-item-inner";
        
        // BUTTON
        var buttonNode = document.createElement("button");
        buttonNode.className = "certificates-item-button";
        buttonNode.setAttribute( "onClick", "javascript: certificates_revoke('" + item.serialNumber + "');" );
        buttonNode.innerText = "-";
        
        inner.appendChild(buttonNode);
        // END BUTTON
        
        // INNER INNER (?!)
        var inner2 = document.createElement("div")
        
        var titleNode = document.createElement("p"); 
        titleNode.className = "certificates-item-title";
        titleNode.innerText = "Device: " + machineName;
        
        inner2.appendChild(titleNode);
        
        var subtitleNode = document.createElement("p"); 
        subtitleNode.className = "certificates-item-subtitle";
        subtitleNode.innerText = "Application: " + applicationName;
        
        inner2.appendChild(subtitleNode);
        
        inner.appendChild(inner2);
        node.appendChild(inner);
        // END INFO
        
        // Spacer
        if (index < certificates.length - 1) {
            var spacer = document.createElement("div")
            spacer.className = "certificates-item-spacer";
            node.appendChild(spacer);
        }
        
        CERTIFICATE_SERIALS = Object.assign([], CERTIFICATE_SERIALS, item.serialNumber);
        
        container.appendChild(node);
    }
    
    $("#login-ui").css("display", "none");
	$("#certificates-ui").css("display", "block");
}