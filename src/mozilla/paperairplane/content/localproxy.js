/* ============= These methods handle spawning our local Java proxy ============= */

/** Paper Airplane's GUID */
var PAPERAIRPLANE_GUID = "{be539ee8-4df7-4b1c-bb58-b68d3fd04a8b}";
/** The local proxies default port */
var PAPERAIRPLANE_LOCAL_PROXY_PORT = "8080";


/** Gets the location to the Java executable */
function getJavaPath() {
	// some versions of FireFox/Mozilla have deprecated the winhooks component
	// for the windowsshellservice component
	var registryComponent, registryInterface;
	if (Components.classes['@mozilla.org/winhooks;1'] == undefined) {
		registryComponent = "@mozilla.org/browser/shell-service;1";
		registryInterface = Components.interfaces.nsIWindowsShellService;
	}
	else {
		registryComponent = "@mozilla.org/winhooks;1";
		registryInterface = Components.interfaces.nsIWindowsRegistry;
	}
	
	// find out what version of Java is the current version on this machine
	var windowsRegistry = Components.classes[registryComponent].getService(registryInterface);
	
	var currentVersion = windowsRegistry.getRegistryEntry(
								registryInterface.HKLM,
								"Software\\JavaSoft\\Java Runtime Environment",
								"CurrentVersion");
	
	// find out the location of this JRE
	var javaHome = windowsRegistry.getRegistryEntry(
								registryInterface.HKLM,
								"Software\\JavaSoft\\Java Runtime Environment\\" + currentVersion,
								"JavaHome");
		
	// to see the DOS window have java.exe instead of javaw.exe
	var javaExecutable = javaHome + getFilePathSeparator() + "bin" + 
						 getFilePathSeparator() + "javaw.exe";
	return javaExecutable;
}

/** Find out the path to the user's profile directory */
function getProfileDir() {
   // First get the directory service and query interface it to
   // nsIProperties
   var dirService = Components.classes['@mozilla.org/file/directory_service;1'].
								getService(Components.interfaces.nsIProperties);

   // Next get the "ProfD" property of type nsIFile from the directory
   // service, FYI this constant is defined in
   // mozilla/xpcom/io/nsAppDirectoryServiceDefs.h
   const NS_APP_USER_PROFILE_50_DIR = "ProfD";
   profileDir = dirService.get(NS_APP_USER_PROFILE_50_DIR, Components.interfaces.nsIFile);

   // Now that we have it we can show it's path. 
   return profileDir.path;
}

/** Runs the Java-based local proxy by spawning a process. */
function startLocalProxy() {
	try {
		if (isProxyStarted()) {
			var origFunc = window.onload;
			window.onload = function() {
				if (origFunc)
					origFunc();
					
				showToolbar();			
			};
			
			return;
		}
			
		var FileConstructor = new Components.Constructor("@mozilla.org/file/local;1", 
		                                                   "nsILocalFile", 
		                                                   "initWithPath");
		
		// Get the path to be able to run Java
		
        var javaPath = new FileConstructor(getJavaPath());
		var process = Components.classes["@mozilla.org/process/util;1"]
									.createInstance(Components.interfaces.nsIProcess);
    	process.init(javaPath);
    	
    	// Build up the path to the executable Paper Airplane JAR
    	var profileDir = getProfileDir();
    	// TODO: Abstract out the particular path seperator by calling
    	// getFilePathSeparator()
    	var extensionDir = profileDir + "\\extensions\\" + PAPERAIRPLANE_GUID;
    	var libDir = extensionDir + "\\components\\dist\\lib";
    	var paperAirplaneJar = libDir + "\\paperairplane.jar";
    	var configDir = extensionDir + "\\components";
	
		// Make sure our shared library is in place
		try {
			var installationDir = Components.classes["@mozilla.org/file/directory_service;1"].
								getService(Components.interfaces.nsIProperties).
								get("CurProcD", Components.interfaces.nsIFile);
			var origDll = new FileConstructor(libDir + "\\TrayIcon12.dll");
			origDll.copyTo(installationDir, "TrayIcon12.dll");
		}
		catch (exception) { } // ignore
    	
    	// Now start the local Java proxy
    	var args = new Array();
		args.push("-jar");
		args.push(paperAirplaneJar);
		args.push(PAPERAIRPLANE_LOCAL_PROXY_PORT);
		args.push(configDir);
        var result = process.run(false, args, args.length);
        
        // TODO: Look at the return result to see if there was an error and update the UI better
        trackProxyStartup();
    }
    catch (exception) {
    	alert("The following exception occurred while starting Paper Airplane's local proxy: " + exception);
    }
}

/** Returns the file path separator for this platform, such as what is used
  * for "/myharddrive/dir1/dir2". */
function getFilePathSeparator() {
	return "\\";
}

/** Returns the classpath separator for this platform, such as a semicolon */
function getClasspathSeparator() {
	return ";";
}

/** Tracks the progress of the proxy as it starts up and reports this in the UI. */
function trackProxyStartup() {
	// add the word Initializing into the toolbar
	var paToolbar = window.parent.document.getElementById("paperairplaneToolbar");
	var paMainBar = window.parent.document.getElementById("mainPaperAirplaneToolbar");
	var htmlDoc = paMainBar.contentDocument;
	var htmlBody = htmlDoc.getElementsByTagName("body")[0];
	// FIXME: Move the formatting of this out to a stylesheet
	htmlBody.innerHTML = "<h4>Initializing Paper Airplane...</h4>";
	
	// now keep hitting the local proxy until the HTTP jetty portion is up
	window.paIntervalID = window.setInterval(trackJettyStartup, 5, paMainBar, htmlBody, false); 	
}

/** Keeps hitting the local proxy until it is up. hideStatus is an optional attribute;
	if true, we don't update the UI with the current status. */
function trackJettyStartup(paMainBar, htmlBody, hideStatus) {
	if (hideStatus == undefined)
		hideStatus = false;
		
	// keep hitting the local proxy until we get back a 200 status code
	var request = new XMLHttpRequest();
	// do a synchronous request; it should be fast so this should be ok
	// FIXME: Refactor out the reference to the exact port
	request.open("HEAD", "http://127.0.0.1:8080", false);
	try {	
		request.send(null);
	}
	catch (exception) {} // ignore
	
	if (request.status == 200) {
		// FIXME: Move the formatting of this out to a stylesheet
		if (hideStatus == false) {
			htmlBody.innerHTML = "<h4>Signing into the Paper Airplane P2P Network...</h4>";
			window.clearInterval(window.paIntervalID);
			// Now actually start our P2P services and sign into the Paper Airplane network
			signOn(paMainBar, htmlBody);
		}
		
		return true;
	}
	else
		return false;
}

/** Signs into the Paper Airplane network and starts up our P2P services. */
function signOn(paMainBar, htmlBody) {
	var request = new XMLHttpRequest();
	// FIXME: Get these constants into a centralized place
	request.open("GET", "http://127.0.0.1:8080/signon/doSignOn.jsp", true);
	request.onreadystatechange=function() {
  	if (request.readyState==4) {
  		// FIXME: Be more robust in terms of errors and the response returned
   		showToolbar(paMainBar);
  	  }
 	}
	request.send(null);	
}

/** Shows the toolbar, ready to be used. */
function showToolbar(paMainBar) {
	if (paMainBar == undefined)
		paMainBar = window.parent.document.getElementById("mainPaperAirplaneToolbar");
	
	paMainBar.setAttribute("src", "http://127.0.0.1:8080/toolbar/");
}

/** Returns whether the proxy is already started. */
function isProxyStarted() {
	try {
		return trackJettyStartup(null, null, true);
	}
	catch (exception) {
		return false;
	}
}

/** HACK: Add the startLocalProxy method to the global window object so that we can access it from our
    javascript: URL handler in paperairplaneOverlay.xul file; we need this so that we know when the browser
    is finished displaying. */
window.parent.document.startLocalProxy = startLocalProxy;