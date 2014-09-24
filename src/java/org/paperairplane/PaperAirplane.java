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
import java.util.*;

//import net.jxta.ext.config.Profiler;

import org.p2psockets.*;
import org.scache.*;
import org.mortbay.util.*;
import org.mortbay.http.*;
import org.mortbay.p2psockets.util.*; 
import org.mortbay.p2psockets.http.*;
import org.mortbay.jetty.*;
import org.mortbay.jetty.servlet.*;
import org.mortbay.http.handler.*;
import org.mortbay.servlet.*; 

/** A central facade that makes it easy to do many common operations on the Paper
  * Airplane network, such as signing on, creating groups, initializing and recreating
  * groups we already created, and so on.  This is called from the LocalServlet to
  * handle many of our operations.
  *
  * @author Brad Neuberg, bkn3@columbia.edu
  */
public class PaperAirplane {
	/** The name of our private P2P network that holds the Paper Airplane network. */
	public static String PAPER_AIRPLANE_NETWORK_NAME = "PaperAirplane";

	private static Thread p2pToWebProxyThread;

	/** The location to this user's .paperairplane directory
	  * where we can store their configuration info. */
	private static String paperairplaneDir;

	private static String userName, password;
    
    private static List groups = new ArrayList();
    
    private static GroupStarter groupStarter;
    
    {
            // FIXME: Do this from a better place (i.e. have Mozilla tell
            // us where the user's profile directory is)
            setConfigurationDirectory(".");
    }
   
    /** @param configDir The location to this user's .paperairplane directory
     * where we can store their configuration info. */ 
    public static void setConfigurationDirectory(String configDir) {
    	paperairplaneDir = configDir;
        
    	// setup where to find and store our configuration files
    	System.setProperty("JXTA_HOME", paperairplaneDir + File.separator + ".jxta");
    }

	/** Signs into the Paper Airplane JXTA network and starts up the P2P to Web proxy
	  * that proxies certain web browser requests into the peer network.
	  */
	public static boolean signOn(String name, String pass) throws Exception {
                setConfigurationDirectory(".");
		try {
            userName = name;
			password = pass;
                        
			// sign into the peer-to-peer network
			System.out.println("Signing into the P2P network..");
                        System.out.println("userName="+userName+", password="+password);
			P2PNetwork.signin(userName, password, PAPER_AIRPLANE_NETWORK_NAME);
			System.out.println("Signed in");
                        
			return true;
		}
		catch (Exception e) {
                        e.printStackTrace();
			throw new Exception(e);
		}
	}

	/** Starts any P2P services that need to run on this peer, after signing on.  This
	  * includes the P2P To Web Proxy and re-creating any Paper Airplane Groups we created
	  * in previous sessions.
	  */
	public static boolean startP2PServices(final int p2pToWebProxyPort) throws Exception {
        System.out.println("Starting P2P services...");
        setConfigurationDirectory(".");
		final String name = userName;
		final String pass = password;
		// start up the P2P to Web proxy
		// FIXME: have it place it's proxy 'store' directory into the
		// user's .paperairplane directory
		// FIXME: handle gracefully stopping this thread and the P2P proxy
		p2pToWebProxyThread = new Thread() {
			public void run() {
                System.out.println("name="+name+", password="+password);
				try {
					P2PToWebProxy p2pToWebProxy = new P2PToWebProxy(name, pass, 
																	PAPER_AIRPLANE_NETWORK_NAME, p2pToWebProxyPort,
																	paperairplaneDir);
					p2pToWebProxy.start(false);
				}
				catch (Exception e) {
					e.printStackTrace();
					// FIXME: we really shouldn't be squelching this exception...
				}
			}
		};
		p2pToWebProxyThread.start();
        
		// start up this user's already created groups
        System.out.println("Starting already created P2P Sites...");
        groupStarter = new GroupStarter(".");
        groupStarter.startExistingGroups();
        
        System.out.println("Paper Airplane ready for takeoff!");

		return true;
	}

	public static boolean registerUser(String userName, String password) throws Exception {
                setConfigurationDirectory(".");
		P2PNetwork.createAccount(userName, password, PAPER_AIRPLANE_NETWORK_NAME);

		return true;
	}

	public static boolean newGroup(final String groupName) throws Exception {
        groups.add(groupStarter.newGroup(groupName, true));
        
        // FIXME: We should have more robust error handling here
        return true;
	}

	public static boolean signOff() throws Exception {
		return true;
	}
}
