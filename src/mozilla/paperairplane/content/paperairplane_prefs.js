/** This file initializes all the preferences we need to make Paper Airplane work. */
/** The try/catch block is needed or else the 'capability' set of prefs won't set. */
try {
	// FIXME: nsIPref is technically deprecated; use the non-deprecated way of dealing with these values
	var prefs = Components.classes["@mozilla.org/preferences;1"].getService(Components.interfaces.nsIPref);
	
	// turn off searching for domain names on Google if they have no domain ending (called Keywords)
	prefs.SetBoolPref("keyword.enabled", false);
	
	// the location of our custom Proxy AutoConfiguration (PAC) file to force
	// Mozilla to use our P2P web proxy for certain kinds of domain names
	prefs.SetCharPref("network.proxy.autoconfig_url", "chrome://paperairplane/content/localproxy.pac");
	
	// use a custom Proxy AutoConfiguration (PAC) file
	prefs.SetIntPref("network.proxy.type", 2);
	
	// turn off adding www. and .com to the end of URLs
	prefs.SetBoolPref("browser.fixup.alternate.enabled", false);
	
	// turn on the prefs that make it possible for us to script XPCOM from our local proxy
	prefs.SetBoolPref("signed.applets.codebase_principal_support", true);
	// FIXME: The p0 permission might already be taken; enumerate already existing prefs
	// and use an unused one 
	prefs.SetCharPref("capability.principal.codebase.p0.granted", "UniversalXPConnect");
	prefs.SetCharPref("capability.principal.codebase.p0.id", "http://127.0.0.1:8080");
}
catch (exception) {
	alert("Exception setting Paper Airplane prefs="+exception);
}

