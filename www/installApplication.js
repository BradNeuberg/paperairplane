/**
   - ***** BEGIN LICENSE BLOCK *****
   - Version: MPL 1.1/GPL 2.0/LGPL 2.1
   -
   - The contents of this file are subject to the Mozilla Public License Version
   - 1.1 (the "License"); you may not use this file except in compliance with
   - the License. You may obtain a copy of the License at
   - http://www.mozilla.org/MPL/
   -
   - Software distributed under the License is distributed on an "AS IS" basis,
   - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
   - for the specific language governing rights and limitations under the
   - License.
   -
   - The Original Code is from Paper Airplane (http://www.paperairplane.us)
   -
   - The Initial Developer of the Original Code is Brad Neuberg.
   - Portions created by the Initial Developer are Copyright (C) 2003
   - the Initial Developer. All Rights Reserved.
   -
   - Contributor(s):
   -
   - Alternatively, the contents of this file may be used under the terms of
   - either the GNU General Public License Version 2 or later (the "GPL"), or
   - the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
   - in which case the provisions of the GPL or the LGPL are applicable instead
   - of those above. If you wish to allow use of your version of this file only
   - under the terms of either the GPL or the LGPL, and not to allow others to
   - use your version of this file under the terms of the MPL, indicate your
   - decision by deleting the provisions above and replace them with the notice
   - and other provisions required by the LGPL or the GPL. If you do not delete
   - the provisions above, a recipient may use your version of this file under
   - the terms of any one of the MPL, the GPL or the LGPL.
   -
   - ***** END LICENSE BLOCK *****
   */

/** The scripts below help to install Java-based XUL applications including the Java Runtime
  * Environment if it is not yet installed.  It also checks to make sure the user is running
  * a browser needed by your application, and if they already have Java installed, if it
  * is the correct version of Java needed for your application.
  *
  * To configure, change the static variables below as appropriate for your application,
  * and call installApplication() from the hyperlink you want users to click to install
  * the app. 
  * 
  * Currently, automatic background installation of the Java Runtime are only supported
  * for Windows.  Users will be directed to the appropriate Java download
  * page for Mac, Solaris, and Linux since silent installation is not supported for these platforms
  * yet (wanna submit an XPI file for these platforms or others then visit java.mozdev.org/java_xpis).
  *
  * The script also installs JSLib (jslib.mozdev.org).
  *
  * @author Brad Neuberg, bkn3@columbia.edu
  */

/** The application that is being installed */
var APP_NAME = "Paper Airplane";

/** The application version that is being installed */
var APP_VERSION = "0.1.1";

/** What is displayed to the user in the XPInstall dialog when they try to install this software. */
var APP_IDENTIFIER = APP_NAME + " " + APP_VERSION;

/** The application's XPI file */
var APP_XPI = "paperairplane.xpi";

/** Whether this application supports Mozilla (not including FireBird) */
var SUPPORTS_MOZILLA = false;

/** Whether this application supports FireBird */
var SUPPORTS_FIREBIRD = true;

/** The smallest version of Mozilla (not including FireBird) that this application supports */
var EARLIEST_SUPPORTED_MOZILLA = 1.2;

/** The smallest version of FireBird that this application supports */
var EARLIEST_SUPPORTED_FIREBIRD = 0.6;

/** The version of Java that must be installed (this or greater). **/
var JAVA_VERSION = "1.5.0";

/** Whether this application only supports this given Java version, and not any that
    are higher (i.e. even if the user has a JRE of a higher version, this version will
	still be installed). */
var ONLY_SUPPORTS_THIS_JAVA_VERSION = false;

/****** Scripts */

/** Checks to make sure that this user has the correct environment to run this application
	and installs the application itself. */
function installApplication() {
	if (!window.confirm("Would you like to install " + APP_IDENTIFIER + "?")) {
		return;
	}

	// first make sure that this user is using Mozilla or Firebird
	if (checkMozillaRuntime() == false) {
		return;
	}

	// Determine the XPI files that need to be installed
	var downloadXPIs = new Object();
	
	// add the Java runtime if needed
	if (!isCorrectVersionOfJavaInstalled()) {
		alert("Your browser does not have the correct, latest version of Java needed to run " + APP_NAME + ". " +
		      "You must have at least version " + JAVA_VERSION + " of the Java Runtime.  Please install this version " +
		      "and retry installing " + APP_NAME);
		return;
	}

	// add our application's XPI file 
	downloadXPIs[APP_IDENTIFIER] = APP_XPI;

	// do the installation
	InstallTrigger.install(downloadXPIs);
}

/** Determines if Java is installed, and if so, if it is at least the version given in JAVA_VERSION */
function isCorrectVersionOfJavaInstalled() {
	var plugins = window.navigator.plugins;

	// go through each plugin looking for the word "Java"
	for (var i = 0; i < plugins.length; i++) {
		var currentPlugin = plugins.item(i);
		var description = currentPlugin.description;
		if (description.indexOf("Java") != -1) {
			// extract the version number (anything that has numbers and dots in it)
			var version = description.match(/[0-9\.]+/);
			// compare it as a floating point number to the Java version we want
			if (ONLY_SUPPORTS_THIS_JAVA_VERSION == false) {
				if (version >= JAVA_VERSION) {
					return true;
				}
			}
			else {
				if (version == JAVA_VERSION) {
					return true;
				}
			}
		}
	}

	return false;
}

function isWindows() {
	return (window.navigator.platform.toLowerCase().indexOf("win32") != -1);
}

function isLinux() {
	return (window.navigator.platform.toLowerCase().indexOf("linux") != -1);
}

function isMacOSX() {
	return (window.navigator.platform.toLowerCase().indexOf("mac") != -1);
}

function isSolaris() {
	return (window.navigator.platform.toLowerCase().indexOf("sun") != -1);
}

/** Determines if this browser supports automatic software updates, if is is mozilla or firebird,
	and if its version is supported. 
	@returns False if this browser, such as Internet Explorer, can not run Paper Airplane. */
function checkMozillaRuntime() {
	// only mozilla runtimes have the InstallTrigger object
	// some earlier versions of Mozilla don't seem to support window.navigator.vendor
	// and window.navigator.vendorSub; we simply drop those here.
	if (InstallTrigger && window.navigator.vendor && window.navigator.vendorSub) {
		if (!InstallTrigger.updateEnabled()) {
			alert("You must enable your browser to receive automatic software updates.");
			return false;
		}	

		var vendor = window.navigator.vendor;
		var vendorSub = window.navigator.vendorSub;
		if (vendor.toLowerCase().indexOf("firebird") != -1) {
			if (!SUPPORTS_FIREBIRD) {
				alert(APP_NAME + " only works in the Mozilla browser. " +
					  "Press OK to be re-directed to a web page to download Mozilla");
				window.open("http://www.mozilla.org/");
				return false;
			}

			if (vendorSub <= EARLIEST_SUPPORTED_FIREBIRD) {
				alert(APP_NAME + " only works with FireBird version " + EARLIEST_SUPPORTED_FIREBIRD +
					  " or later.  Press OK to be re-directed to a web page to download a newer version of FireBird");
				window.open("http://www.mozilla.org/");
				return false;
			}

			return true;
		}
		else if (vendor.toLowerCase().indexOf("mozilla") != -1) {
			if (!SUPPORTS_MOZILLA) {
				alert(APP_NAME + " only works in the FireBird browser. " +
					  "Press OK to be re-directed to a web page to download FireBird");
				window.open("http://www.mozilla.org/");
				return false;
			}

			if (vendorSub <= EARLIEST_SUPPORTED_MOZILLA) {
				alert(APP_NAME + " only works with Mozilla version " + EARLIEST_SUPPORTED_MOZILLA +
					  " or later.  Press OK to be re-directed to a web page to download a newer version of Mozilla");
				window.open("http://www.mozilla.org/");
				return false;
			}

			return true;
		}
	}
	else if (InstallTrigger) {
		alert("Your version of Mozilla does not support features needed by " + APP_NAME + ". " +
			  "Press OK to be re-directed to a web page to download the latest version of Mozilla or FireBird");
		window.open("http://www.mozilla.org/");
		return false;
	}
	else { // Internet Explorer!
		if (SUPPORTS_MOZILLA && SUPPORTS_FIREBIRD) {
			alert(APP_NAME + " only works in Mozilla and FireBird browsers. " +
			      "Press OK to be re-directed to a web page to download Mozilla or FireBird");
		}
		else if (!SUPPORTS_MOZILLA && SUPPORTS_FIREBIRD) {
			alert(APP_NAME + " only works in the FireBird browser. " +
			      "Press OK to be re-directed to a web page to download FireBird");
		}
		else if (SUPPORTS_MOZILLA && !SUPPORTS_FIREBIRD) {
			alert(APP_NAME + " only works in the Mozilla browser. " +
			      "Press OK to be re-directed to a web page to download Mozilla");
		}
		
		window.open("http://www.mozilla.org/");
		return false;
	}
}

