/* -*- Mode: Javascript; tab-width: 2; c-basic-offset: 2; -*-
 * 
 * The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s): 
 *
 *  Doug Turner   <dougt@acm.org> 
 *  Pete Collins  <petejc@mozdev.org> 
 *  Brad Neuberg <bkn3@columbia.edu>
 */

const VERSION             = "0.1.1";

// FIXME: Install this into the program directory not the user directory
var chromeDir = getFolder("Current User", "chrome");
var componentsDir = getFolder("Current User", "components");
var userDir = getFolder("Current User");
var tempDir = getFolder("Temporary");
var programDir = getFolder("Program");

var err = initInstall("Paper Airplane " + VERSION, "paperairplane", VERSION);
logComment("initInstall for Paper Airplane: " + err);

// TODO: actually verify that there is enough space

// unpack all of the Paper Airplane chrome
err = addDirectory("Chrome",
				   VERSION,
				   "mozilla/paperairplane",							// jar source folder                     
				   getFolder(chromeDir, "paperairplane"),			// target folder                     
				   "",												// target subdir                      
				   true);											// force flag   
				   
logComment("Added Paper Airplane chrome: " + err);

// register the content and skin chrome
registerChrome(CONTENT | DELAYED_CHROME, chromeDir, "paperairplane/content/"); 
registerChrome(SKIN | DELAYED_CHROME, chromeDir, "paperairplane/skin/");

// add our application directory
err = addDirectory("PaperAirplane",
				   VERSION,
				   "paperairplane",
				   programDir,
				   "",
				   true);
logComment("Creating paperairplane directory: " + err);

// copy over the shared library needed by the Tray Icon package to the Windows directory
// FIXME: What about Linux/Mac?
var sharedLibrariesDir = getFolder("Windows");
err = addFile("PaperAirplane",
			  VERSION,
			  "paperairplane/dist/lib/TrayIcon12.dll",
			  sharedLibrariesDir,
			  "");
logComment("Copied over trayicon12.dll to " + sharedLibrariesDir + ": " + err);

// actually perform the installation
err = getLastError();

if (err==SUCCESS) {
    performInstall();
	alert("Paper Airplane successfully installed.  Please restart your browser.");
}
else {
    cancelInstall(err);
}


/** ------------ Functions ------------ */ 

// this function verifies disk space in kilobytes
function verifyDiskSpace(dirPath, spaceRequired)
{
   var spaceAvailable;
   // Get the available disk space on the given path
   spaceAvailable = fileGetDiskSpaceAvailable(dirPath);

   // Convert the available disk space into kilobytes
   spaceAvailable = parseInt(spaceAvailable / 1024);
   // do the verification
   if(spaceAvailable < spaceRequired)
   {
      logComment("Insufficient disk space: " + dirPath);
      logComment("  required : " + spaceRequired + " K");
      logComment("  available: " + spaceAvailable + " K");
      return(false);
   }
   return(true);
}
