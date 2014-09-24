/** FIXME: Refactor all these javascript functions into their own files/areas. */

/** Changes the URL that the browser is at. */
function changeBrowserLocation(newLocation) {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    window.parent.content.location.href = newLocation;
}

/** Returns the URL that the browser is at. */
function getBrowserLocation() {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    return window.parent.content.location.href;
}

/** Edits the current page that is displayed in the browser. */
// FIXME: TODO: This won't work if you are at the root with no Wiki info at the end
function editPage() {
    var pageName = getCurrentPageName();
    var domainName = getCurrentDomainName();
    
    if (isAtSiteRoot()) {
    	// FIXME: We should not be hard coding the name of the main page here
    	pageName = "Main";
    }
    
   	changeBrowserLocation("http://" + domainName + "/Edit.jsp?page=" + pageName); 
}

function getCurrentDomainName() {
    var currentURL = getBrowserLocation();
    // filter out the http:// portion
    // FIXME: Make this much more robust with a regular expression and handle
    // more edge cases
    var domainName = currentURL.substring(7);
    domainName = domainName.substring(0, domainName.indexOf("/"));
    return domainName;
}

function getCurrentPageName() {
    var currentURL = getBrowserLocation(); 
    var pageName = currentURL.substring(currentURL.indexOf("page=") + 5); 
    return pageName;
}

/** Determines if we are at the root of a site with no path info, i.e. we are at
    http://www.nike.laborpolicy and not http://www.nike.laborpolicy/Wiki.jsp?page=Foobar. */
function isAtSiteRoot() {
	var loc = getBrowserLocation();
	// Match from beginning of the line, with one optional http:// expression, followed
	// by anything but another slash, followed by an optional slash, followed by
	// the end of the line; be case insensitive
	return loc.match(/^(http:\/\/)?[^\/]*\/?$/i);	
}

/** Creates a new page. */
function newPage() {
	changeBrowserLocation("/new-page/?domainname=" + getCurrentDomainName());
}

/** Saves the current page. */
function savePage() {
	// FIXME: Getting the value of the text comes back blank; fix this and implement this
	// function
	/*
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var pageName = getCurrentPageName();
	var domainName = getCurrentDomainName();

	// get the values to return
	var textToSave = window.parent.getBrowser().contentDocument.getElementById("textToSave").value;
	alert("_content="+window.parent._content);
	alert("contentDocument="+window.parent._content.document.getElementById("textToSave").value);
	var editTime = window.parent.content.document.getElementById("edittime").value;
	try {
	// build up a POST request
	var url = "http://" + domainName + "/Edit.jsp";
	var req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.onreadystatechange=function() {
	  // FIXME: Do more robust error processing and reporting here
	  if (req.readyState==4) {
	    changeBrowserLocation("http://" + domainName + "/Wiki.jsp?page=" + pageName);
	  }
	 }
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send("page="+pageName+"&edittime="+editTime+"&text="+textToSave+"&ok=Save&action=save");
	} catch (exception) { alert(exception); }*/
}

/** Cancels editing the current page. */
function cancelEditingPage() {
}
