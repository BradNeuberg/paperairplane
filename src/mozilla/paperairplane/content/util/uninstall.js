/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mouse paperairplane for Mozilla.
 *
 * The Initial Developer of the Original Code is Pavol Vaskovic.
 * Portions created by the Initial Developer are Copyright (C) 2001
 * the Initial Developer. All Rights Reserved.
 *	
 *  Contributor(s):
 *  Chase Tingley <tingley@sundell.net>
 *  David Perry <d.perry@utoronto.ca>
 *  Pavol Vaskovic <pali@pali.sk>
 *
 *	John Woods <johnrw@bestweb.net> April 2003
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


// Functions for uninstalling the Paper Airplane plugin.
// based on paperairplane.mozdev.org's chrome/content/paperairplane/freshInstall.js file.
// -- Brad Neuberg, bkn3@columbia.edu

const kDirServiceCID = Components.ID("{f00152d0-b40b-11d3-8c9c-000064657374}");
const nsIProperties = Components.interfaces.nsIProperties;
const nsIFileIID = Components.ID("{c8c0a080-0868-11d3-915f-d9d889d48e3c}");

var dSrv = Components.classes['@mozilla.org/file/directory_service;1'].createInstance();
dSrv = dSrv.QueryInterface(Components.interfaces.nsIProperties);

var ios = Components.classes["@mozilla.org/network/io-service;1"]
    	.getService(Components.interfaces.nsIIOService);

function confirmUninstall(){
  // ask user if she really wants to
  if(confirm("Are you sure you want to uninstall Paper Airplane?  The browser will be shutdown to fully uninstall.")) {
    paperairplaneUninstall("AChrom"); // multi-user uninstall
	paperairplaneUninstall("UChrm"); // single-user uninstall

	// should give us a second or two, before the exit
	alert("Paper Airplane has been removed");
	goQuitApplication();
  }
}

function paperairplaneUninstall(cTyp){
  dump("Paper Airplane: "+cTyp+" paperairplaneUninstall\n");

  removePackageReferences(cTyp); 
  // remove their paperairplane preferences
  var pref = Components.classes["@mozilla.org/preferences-service;1"]
  			.getService(Components.interfaces.nsIPrefService);
  var rootBranch = pref.getBranch("");
	// this is a bit much, couple of bytes really
	rootBranch.deleteBranch("paperairplane.");
}


function removePackageReferences(cTyp){
  dump("Paper Airplane: removePackageReferences\n");
var chromeUrl
var dSrvI;

// BEGIN
	//remove installed-chrome.txt lines first
	if(cTyp=="AChrom") {
		rmvInstalledChrome();
	}
	dSrvI = dSrv.get(cTyp, Components.interfaces.nsIFile);
	dSrvI.append("chrome.rdf");
	fileUri=getFileUri( dSrvI );
	// chromeUrl is the
    // file:// url of the chrome.rdf file 
    // We use it after removing the overlayinfo pointers

	var chromeUrl = fileUri ;




/* ///////////////////// Remove Overlayinfo Data /////////////////////////// */

var folderName		= "navigator" ;
var containerItem   = "chrome://navigator/content/navigator.xul" ;
var nodeItem        = "chrome://paperairplane/content/paperairplaneOverlay.xul" ;
try { rmvOverlaysRDF(cTyp, folderName, containerItem, nodeItem ) ;}
catch (e)
{ alert("removing overlayinfo in folder... Navigator failed"); }

folderName			= "communicator" ;
containerItem   	= "chrome://communicator/content/pref/preftree.xul" ;
nodeItem        	= "chrome://paperairplane/content/paperairplanePrefOverlay.xul" ;
try { rmvOverlaysRDF(cTyp, folderName, containerItem, nodeItem ) ;}
catch (e)
{ alert("removing overlayinfo in folder... Communicator failed"); }

folderName		 	= "browser" ;
containerItem    	= "chrome://browser/content/browser.xul" ;
nodeItem         	= "chrome://paperairplane/content/paperairplaneOverlay.xul" ;
try { rmvOverlaysRDF(cTyp, folderName, containerItem, nodeItem ) ;}
catch (e)
{ alert("removing overlayinfo in folder... Browser failed"); }

folderName		 	= "browser" ;
containerItem    	= "chrome://browser/content/pref/pref.xul" ;
nodeItem         	= "chrome://paperairplane/content/paperairplanePrefOverlay.xul" ;
try { rmvOverlaysRDF(cTyp, folderName, containerItem, nodeItem ) ;}
catch (e)
{ alert("removing overlayinfo in folder... Browser failed"); }


/* ///////////////////// Remove Chrome.rdf Data //////////////////////////// */

  dump("\tchrome url is " + chromeUrl + "\n");
  // remove our references from chrome/chrome.rdf
  dump("Call RDFU.loadDataSource\n" + chromeUrl + "\n");
  RDFU.loadDataSource(chromeUrl , removeFromChrome);
  dump("RDFU.loadDataSource returned OK.\n");


/* ///////////////////// Delete Files and Folder /////////////////////////// */

dSrvI = dSrv.get(cTyp, Components.interfaces.nsIFile); // reset it
dSrvI.append("paperairplane");

// fixme later this is redundant?
fileUri=getFileUri( dSrvI );

dump("\tDeleting paperairplane directory: \n\t" + dSrvI.path + "\n");

// commented out because we don't want to pop this dialog up two times
// bkn3@columbia.edu
//var delFils=confirm("Would you also like to delete the Paper Airplane files");
//if(delFils)
//{
  try {
    var rv = dSrvI.remove(true);
    dump("\n\tPaper Airplane: directory exists and was deleted:"+rv+"\n" + dSrvI.path +"\n" );
  }
  catch (err) {
    dump("\tpaperairplane directory NOT deleted. ERROR:\n" + err + "\n");
    alert("There was a problem removing the paperairplane directory: "+ err);
  }
//}

// should give us a second or two, before the exit
alert("Paper Airplane is now uninstalled.  The browser must be shut down to finish uninstallation.");
goQuitApplication();

// DONE!  
}




/* ///////////////////// Remove All Chrome Data  /////////////////////////// */

// removeFromChrome is listener that removes all paperairplane references from 
// chrome/chrome.rdf when this DataSource is loaded
var removeFromChrome = {
  onDataSourceReady: function(aDS) 
  {
    dump("Paper Airplane: removeFromChrome\n");

    // get the sequence that holds all the packages
    var rootSeq = RDFU.findSeq(aDS, "urn:mozilla:package:root");

    // get resource and node for your package
    var myResource = gRDF.GetResource("urn:mozilla:package:paperairplane");
    var myNode = myResource.QueryInterface(Components.interfaces.nsIRDFNode);

    // and snip out your arc
    rootSeq.RemoveElement(myNode, true);

    // now remove everything else we know about your package
    var arcs = aDS.ArcLabelsOut(myResource);

    while(arcs.hasMoreElements()) {
      var arc = arcs.getNext();
    
      // each arc is a property
      var prop = arc.QueryInterface(Components.interfaces.nsIRDFResource);

      // For each property, get all targets, and unassert.  nested 
      // enumeration is the best!
      var targets = aDS.GetTargets(myResource, prop, true);

      while(targets.hasMoreElements()) {
        var target = targets.getNext();

        var targetNode = target.QueryInterface(Components.interfaces.nsIRDFNode);
        aDS.Unassert(myResource, prop, targetNode);
      }
    }
    
	//resource="urn:mozilla:locale:en-US:packages"
	//resource="urn:mozilla:locale:en-US:paperairplane"
    dump("Paper Airplane: locales removeFromChrome\n");

    // get the sequence that holds all the packages
    var rootSeq = RDFU.findSeq(aDS, "urn:mozilla:locale:en-US:packages");

    // get resource and node for your package
    var myResource = gRDF.GetResource("urn:mozilla:locale:en-US:paperairplane");
    var myNode = myResource.QueryInterface(Components.interfaces.nsIRDFNode);

    // and snip out your arc
    rootSeq.RemoveElement(myNode, true);

    // now remove everything else we know about your package
    var arcs = aDS.ArcLabelsOut(myResource);

    while(arcs.hasMoreElements()) {
      var arc = arcs.getNext();
    
      // each arc is a property
      var prop = arc.QueryInterface(Components.interfaces.nsIRDFResource);

      // For each property, get all targets, and unassert.  nested 
      // enumeration is the best!
      var targets = aDS.GetTargets(myResource, prop, true);

      while(targets.hasMoreElements()) {
        var target = targets.getNext();

        var targetNode = target.QueryInterface(Components.interfaces.nsIRDFNode);
        aDS.Unassert(myResource, prop, targetNode);
      }
    }




    // now flush the datasource back to disk
    RDFU.saveDataSource(aDS);
    dump("Paper Airplane: removeFromChrome OK\n");

  },

  onError: function(aStatus, aErrorMsg)
  {
    dump("Paper Airplane: removeFromChrome ERROR: status="+aStatus+",", aErrorMsg);
  }
};




try {
var gRDF = Components.classes['@mozilla.org/rdf/rdf-service;1'].getService();
gRDF = gRDF.QueryInterface(Components.interfaces.nsIRDFService);

var gRDFC = Components.classes['@mozilla.org/rdf/container;1'].getService();
gRDFC = gRDFC.QueryInterface(Components.interfaces.nsIRDFContainer);

var gRDFCU = Components.classes['@mozilla.org/rdf/container-utils;1'].getService();
gRDFCU = gRDFCU.QueryInterface(Components.interfaces.nsIRDFContainerUtils);
} catch (ex) { alert("RDFU: " + ex);  }




var RDFU = {
  
  getSeqElementAt: function(aSeq, aIndex)
  {
  	var ordinal = gRDFCU.IndexToOrdinalResource(aIndex+1);
    return aSeq.DataSource.GetTarget(aSeq.Resource, ordinal, true);
  },
  
  readAttribute: function(aDS, aRes, aName)
  {
  	var attr = aDS.GetTarget(aRes, gRDF.GetResource(aName), true);
    if (attr)
    	attr = XPCU.QI(attr, "nsIRDFLiteral");
  	return attr ? attr.Value : null;
  },
  
  
  writeAttribute: function(aDS, aRes, aName, aValue)
  {
  	var attr = aDS.GetTarget(aRes, gRDF.GetResource(aName), true);
    if (attr)
    	aDS.Change(aRes, gRDF.GetResource(aName), attr, gRDF.GetLiteral(aValue));
  },
  
  
  findSeq: function(aDS, aResName)
  {
  	try {
      var res = gRDF.GetResource(aResName);
      seq = this.makeSeq(aDS, res);
    } catch (ex) { 
      alert("Unable to find sequence" + ex); 
    }
  
    return seq;
  },
  
  makeSeq: function(aDS, aRes)
  {
    var seq = XPCU.createInstance("@mozilla.org/rdf/container;1", "nsIRDFContainer");
  	seq.Init(aDS, aRes);
    return seq;
  },
  
  createSeq: function(aDS, aBaseRes, aArcRes)
  {
    var res = gRDF.GetAnonymousResource();
    aDS.Assert(aBaseRes, aArcRes, res, true);
    var seq = gRDFCU.MakeSeq(aDS, res); 
    return seq;
  },
  
  loadDataSource: function(aURL, aListener) 
  {
  	var ds = gRDF.GetDataSource(aURL);
    var rds = XPCU.QI(ds, "nsIRDFRemoteDataSource");
    
    var observer = new DSLoadObserver(aListener);
    
    if (rds.loaded) {
    	observer.onEndLoad(ds);
    } else {
      var sink = XPCU.QI(ds, "nsIRDFXMLSink");
      sink.addXMLSinkObserver(observer);
    }
  },
  
  saveDataSource: function(aDS)
  {
    var ds = XPCU.QI(aDS, "nsIRDFRemoteDataSource");
    ds.Flush();
  }
};

///////////

function DSLoadObserver(aListener) { this.mListener = aListener; }

DSLoadObserver.prototype =
{
  onBeginLoad: function(aSink) { },
  onInterrupt: function(aSink) {},
  onResume: function(aSink) {},
  onError: function(aSink, aStatus, aErrorMsg)
  {

    this.mListener.onError(aStatus, aErrorMsg);

  },

  onEndLoad: function(aSink)
  {
    var ds = XPCU.QI(aSink, "nsIRDFDataSource");
    var sink = XPCU.QI(ds, "nsIRDFXMLSink");
    this.mListener.onDataSourceReady(ds);

  }

};


var XPCU = 
{ 
  getService: function(aURL, aInterface)
  {
    try {
      return Components.classes[aURL].getService(Components.interfaces[aInterface]);
    } catch (ex) {
      dump("Error getting service: " + aURL + ", " + aInterface + "\n" + ex);
      return null;
    }
  },

  createInstance: function (aURL, aInterface)
  {
    try {
      return Components.classes[aURL].createInstance(Components.interfaces[aInterface]);
    } catch (ex) {
      dump("Error creating instance: " + aURL + ", " + aInterface + "\n" + ex);
      return null;
    }
  },

  QI: function(aEl, aIName)
  {
    try {
      return aEl.QueryInterface(Components.interfaces[aIName]);
    } catch (ex) {
      throw("Unable to QI " + aEl + " to " + aIName);
    }
  }

};


function rmvInstalledChrome() {
var dSrvI = dSrv.get("AChrom", Components.interfaces.nsIFile);
dSrvI.append("installed-chrome.txt");

var fileBuf = ReadFrom(dSrvI);
fileBuf = fileBuf.replace(new RegExp('[^\\n\\r]+'+"resource:/chrome/paperairplane/content/"+'[\\n\\r]+', 'g'), '');
WriteTo(dSrvI, fileBuf);

fileBuf = ReadFrom(dSrvI);
fileBuf = fileBuf.replace(new RegExp('[^\\n\\r]+'+"/paperairplane/"+'[\\n\\r]+', 'g'), '');
WriteTo(dSrvI, fileBuf);

}

  function ReadFrom(f) 
{
 netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
var stream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
if(f.exists())stream.init(f, 1, 0, false); // open as "read only"
else return ;

var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
scriptableStream.init(stream);

var fileSize = scriptableStream.available();
var fileContents = scriptableStream.read(fileSize);

scriptableStream.close();
stream.close();

return fileContents;
}

function WriteTo(f, buf) 
{
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
if (f.exists()) f.remove(true);
f.create(f.NORMAL_FILE_TYPE, 0666);

var stream =
Components.classes['@mozilla.org/network/file-output-stream;1']
.createInstance(Components.interfaces.nsIFileOutputStream);

stream.init(f, 2, 0x200, false); // open as "write only"
stream.write(buf, buf.length);
stream.close();

}  


// remove the overlay entry in overlays.rdf
function rmvOverlaysRDF(cTyp, folderName, containerItem, nodeItem ){

var dSrvI = dSrv.get(cTyp, Components.interfaces.nsIFile);
dSrvI.append("overlayinfo");
dSrvI.append(folderName);
dSrvI.append("content");
dSrvI.append("overlays.rdf");

removeRDFContainer(dSrvI, containerItem, nodeItem);
}


function removeRDFContainer(fileRef, containerName, nodeName)
{
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
var C                       		= Components;
const RDF_SRVC_PROG_ID      		= '@mozilla.org/rdf/rdf-service;1';
const RDF_CONTAINER_PROG_ID 		= '@mozilla.org/rdf/container;1';
const RDF_DS_PROG_ID        		= '@mozilla.org/rdf/datasource;1?name=xml-datasource';
const RDF_CONTAINER_UTILS_PROG_ID 	= '@mozilla.org/rdf/container-utils;1';

	if (!fileRef.exists()) {
	    return;
	}

	var myFileUrl=getFileUri( fileRef );


    try {
      var rdf   = C.classes
                  [RDF_SRVC_PROG_ID].getService(C.interfaces.nsIRDFService);

      var ds    = rdf.GetDataSource(myFileUrl);
	  var aDS   = ds.QueryInterface(C.interfaces.nsIRDFDataSource);
      var rem   = ds.QueryInterface(C.interfaces.nsIRDFRemoteDataSource);
      if (!rem.loaded) {
        rdf.UnregisterDataSource(ds);
        ds        = C.classes[RDF_DS_PROG_ID].
                    getService(C.interfaces.nsIRDFDataSource);
        rem       = ds.QueryInterface(C.interfaces.nsIRDFRemoteDataSource);
        rem.Init(myFileUrl);
      }
      rem.Refresh(true);
      
      var rs  = rdf.GetResource(containerName);
      var container = C.classes[RDF_CONTAINER_PROG_ID].
                           getService(C.interfaces.nsIRDFContainer);

      var contUtils = C.classes[RDF_CONTAINER_UTILS_PROG_ID].
                           getService(C.interfaces.nsIRDFContainerUtils);

      container.Init(rem, rs);
      var el = rdf.GetLiteral(nodeName); // remove if it's a literal

	  if(el.Value){
      dump("Test Empty Literal:" + el.Value + "\n"
	      + container.GetCount() +"\n"
	      + contUtils.IsEmpty(rem,rs) +"\n");
	      container.RemoveElement(el, true);


      var empt=contUtils.IsEmpty(rem,rs);
      if(empt)
        dump("Empty Container\n" );
	  }
      else
      dump("Not an Element" + el.Value + "\n");

      el = rdf.GetResource(nodeName); // remove if it's a resource
	  if(el.Value){
      dump("Test Empty Resource:" + el.Value +"\n"
	      + container.GetCount() +"\n"
	      + contUtils.IsEmpty(rem,rs) +"\n");

	      container.RemoveElement(el, true);


    }
      else
      dump("Not Resource" + el.Value +"\n");
      
      var empt=contUtils.IsEmpty(rem,rs);
      if(empt)
		dump("Empty Container\n" );


      rem.Flush();
      rem.Refresh(true);


    } catch (err) {
    	dump("Remove RDF error:" + err);
      return;
    }
// if this overlayinfo file is empty - remove it
isGraphEmpty(fileRef);
if(!itWasntEmpty)
fileRef.remove(true);
}


// globals
var thisDatasource = null;
var itWasntEmpty = null;

function isGraphEmpty(dsURI ) {

var C                       		= Components;
const RDF_SRVC_PROG_ID      		= '@mozilla.org/rdf/rdf-service;1';
const RDF_CONTAINER_PROG_ID 		= '@mozilla.org/rdf/container;1';
const RDF_DS_PROG_ID        		= '@mozilla.org/rdf/datasource;1?name=xml-datasource';
const RDF_CONTAINER_UTILS_PROG_ID 	= '@mozilla.org/rdf/container-utils;1';

	if (!dsURI.exists()) {
	    return;
	}

	var myFileUrl=getFileUri( dsURI );
  

	dump("\n\nThis file:\n"+dsURI.path+"\n");
    
      var rdf   = C.classes
                  [RDF_SRVC_PROG_ID].getService(C.interfaces.nsIRDFService);

      var ds    = rdf.GetDataSource(myFileUrl);
	  var aDS   = ds.QueryInterface(C.interfaces.nsIRDFDataSource);
      thisDatasource  = ds.QueryInterface(C.interfaces.nsIRDFRemoteDataSource);
      if (!thisDatasource.loaded) {
        rdf.UnregisterDataSource(ds);
        ds        = C.classes[RDF_DS_PROG_ID].
                    getService(C.interfaces.nsIRDFDataSource);
        thisDatasource  = ds.QueryInterface(C.interfaces.nsIRDFRemoteDataSource);
        thisDatasource.Init(myFileUrl);
      }


     if (thisDatasource.loaded) {
   	dump("the datasource was already loaded!\n");
   		Observer.onEndLoad(thisDatasource);
     } else {
   	dump("the datasource wasn't loaded, but it's loading now!\n");

          var sink =
               thisDatasource.QueryInterface(
               Components.interfaces.nsIRDFXMLSink);
		       sink.addXMLSinkObserver(Observer);

     }


}



var Observer = {
   onBeginLoad: function(aSink)
     {},
   onInterrupt: function(aSink) 

     {},

   onResume: function(aSink)
     {},

   onEndLoad: function(aSink)
     {

		var dsResources = thisDatasource.GetAllResources();
		var thisResource = null;
		var arcCursor = null;
		var thisArc = null;
		var arcsCounted = targetsCounted = null;

        while(dsResources.hasMoreElements()) {

        thisResource = dsResources.getNext().QueryInterface(
                        Components.interfaces.nsIRDFResource);

		arcCursor = thisDatasource.ArcLabelsOut(thisResource);

		arcsCounted += 1;
		showArcs(thisResource, arcCursor);
	}

         itWasntEmpty = targetsCounted;
    },

   onError: function(aSink, aStatus, aErrorMsg)
     { dump("error! \n" + aErrorMsg +"\n"); }
};


function showArcs(thisResource, arcCursor) {

     while(arcCursor.hasMoreElements()) {
         arcsCounted += 1;
         thisArc = arcCursor.getNext().QueryInterface(
                   Components.interfaces.nsIRDFResource);

         arcTargets = thisDatasource.GetTargets(
                         thisResource,
                         thisArc,
                         true );


         while(arcTargets.hasMoreElements()) {

             targetsCounted += 1 ;			 
             thisTarget = arcTargets.getNext();


             try {
             thisTarget.QueryInterface(
                 Components.interfaces.nsIRDFLiteral);
            
             } catch(e) {
                newArcCursor = thisDatasource.ArcLabelsOut(
                               thisTarget);
				targetsCounted -= 1 ;
                showArcs(thisTarget, newArcCursor);
             }

    }

  }

}

function getFileUri( fpath ) {

    // Interface change - ns7 (mozilla 1.0) needs nsIIOService
    // latter (mozilla 1.2) needs nsIFileProtocolHandler
    if(Components.interfaces.nsIFileProtocolHandler){
      var fileHandler =
      ios.getProtocolHandler("file")
      .QueryInterface(Components.interfaces.nsIFileProtocolHandler);  
      var newUri = fileHandler.getURLSpecFromFile(fpath);
    } else {
      var newUri = ios.getURLSpecFromFile(fpath);
    }
    
  return newUri;
} 