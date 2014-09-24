/* - ***** BEGIN LICENSE BLOCK *****
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
   - Portions created by the Initial Developer are Copyright (C) 2005
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

package org.paperairplane;

import java.io.*;

import org.p2psockets.*;
import org.scache.*;
import org.mortbay.util.*;
import org.mortbay.http.*;
import org.mortbay.p2psockets.jetty.*;
import org.mortbay.p2psockets.util.*;
import org.mortbay.p2psockets.http.*;
import org.mortbay.jetty.*;
import org.mortbay.jetty.servlet.*;
import org.mortbay.http.handler.*;
import org.mortbay.servlet.*; 

/** Represents a Paper Airplane Group.  
  * Internally we are a thread that wraps a P2P web server that waits for requests from clients.	
  *
  * @author Brad Neuberg, bkn3@columbia.edu
  */
public class Group extends Thread {
	/** The thread running and waiting for P2P web requests for this group.*/
	private Thread groupThread;

	/** Our groups name; this is the name that is published on the P2P network as our 'domain' name. */
	private String groupName;

	/** Holds any exceptions that may have occurred. */
	private Exception exp;

	/** A reference to our P2P web server. */
	private Server server;

	/** Whether we are running or not. */
	private boolean groupStarted = false;

	public Group(String groupName) {
		this.groupName = groupName;
	}

	/** Starts this group.  Call start() on your Group instance to start the group. */
	public void run() {
		// make sure we aren't already started
		if (groupStarted) {
			return;
		}
		
		try {
			// Create the server
			createServer();

			// Start the http server
			server.start();
		}
		catch (Exception e) {
			e.printStackTrace();
			// save the exception if someone is interested in it
			this.exp = e; 
		}

		groupStarted = true;
	}

	/** Gets this groups name. */
	public String getGroupName() {
		return groupName;
	}

	/** Returns whether this group has started or not. */
	public boolean isStarted() {
	       return groupStarted;
	}

	private void createServer() throws IOException, P2PInetAddressException {
		// Create the server
		server = new P2PServer();

		// Create a port listener
		System.out.println("Starting web server for " + groupName + "...");
		SocketListener listener = new P2PSocketListener();
		listener.setInetAddress(P2PInetAddress.getByAddress(groupName, null));
		listener.setPort(80);
		server.addListener(listener);

		// Create a context
		HttpContext context = new HttpContext();
		context.setContextPath("/");
		server.addContext(context);

		// Create a servlet container
		ServletHandler servlets = new ServletHandler();
		context.addHandler(servlets);

		// Map a servlet onto the container
		servlets.addServlet("Dump","/Dump/*","org.mortbay.servlet.Dump");
		System.out.println("current dir="+System.getProperty("user.dir"));
        // The path to our Wiki WAR file is different if we are being run for testing
        // in a paperairplane development directory or in actual production
        String wikiWarPath = "./dist/wars/JSPWiki.war";
        File debugWikiPath = new File(wikiWarPath);
        if (debugWikiPath.exists() == false)
            wikiWarPath = System.getProperty("paperairplane.dir") + "/dist/wars/JSPWiki.war";
		WebApplicationContext wikiCtx = server.addWebApplication("", wikiWarPath);
        // This parameter is needed so that JSPWiki can internally know where to store its pages
        wikiCtx.setInitParameter("hostname", getGroupName());
	}
} 
