#Intro

Paper Airplane is a Mozilla plugin that empowers people to easily create collaborative P2P web sites, without setting up servers or spending money. It does this by integrating a web server into the browser itself, including tools to create collaborative online communities that are stored on the machine. Paper Airplane Groups are stored locally on a user's machine. A peer-to-peer network is created between all of the Paper Airplane nodes that are running in order to resolve group names and reach normally unreachable peers due to firewalls or NAT devices.

Parts of Paper Airplane have been modularized into the [P2P Sockets](https://web.archive.org/web/20060503110718/http://p2psockets.jxta.org/) project, a reimplementation of standard Java sockets on top of Jxta and ports of standard web servers, servlet engines, etc. to run on top of a peer-to-peer network. P2P Sockets is at a 1.0 beta level, while Paper Airplane development is just beginning. Paper Airplane code will be posted to this site as it is developed.

See the [demo screencast](https://web.archive.org/web/20060221181208/http://paperairplane.dev.java.net/docs/tutorials/plugin_screencast.html) of Paper Airplane in action to get a quick overview.

Paper Airplane was a research project and associated prototype to explore what a P2P version of the web and web browsers would look like. You can read the final paper on it [here](http://codinginparadise.org/paperairplane). This is a prototype and was produced to explore some of the ideas in the final research paper. As the paper is finished so is this prototype; development is finished and support is not maintained any more for this code base. It is present here only for archival purposes.

#License Information

Paper Airplane is fully open-source.

Paper Airplane is under the same tri-licensing scheme as Mozilla, which is the MPL 1.1/GPL 2.0/LGPL 2.1 licenses,
any of which can be used as desired.  The MPL is the Mozilla Public License, which is available at
http://www.mozilla.org/MPL/MPL-1.1.html.  GPL is the GNU Public License, which is available at
http://www.gnu.org/licenses/gpl.txt.  LGPL is the Limited/Lesser GNU Public License, which is available at
http://www.opensource.org/licenses/lgpl-license.php.

Paper Airplane depends on the P2P Sockets project, which is under the Sun Project JXTA
Software License, which is based on the Apache Software License Version 1.1.  A copy of the License
is available at http://www.jxta.org/jxta_license.html.  See the P2P Sockets project README file for full license information
on P2P Sockets and software which has been ported to run on the P2P Sockets framework.

Paper Airplane includes code taken from the Googlebar project, located at googlebar.mozdev.org.  Googlebar is under
the same tri-licensing scheme as Paper Airplane.

Paper Airplane includes a project to help create the tray icon on Windows, named TrayIcon (version 1.7.8.c).  The web
page for this project is at http://jeans.studentenweb.org/java/trayicon/ and is under a BSD-type license.

#Building

You must have the following software installed to build Paper Airplane:
	* JDK 1.5+ - http://java.sun.com/j2se/1.5.0/download.jsp
	* Ant 1.6.0 - http://ant.apache.org/bindownload.cgi
	* P2P Sockets 1.2 - http://p2psockets.jxta.org
	* Mozilla or Firefox - http://www.mozilla.org
    * Tomcat 5.5.4

You must set the following environment variables to build the source:

	* paperairplane_home - The location of your Paper Airplane installation
	* p2psockets_home - The location of your P2P Sockets installation
	* tomcat_home - The location of your Tomcat installation
	* java_home - The location of your Java SDK (note that java_home is lowercase and is not JAVA_HOME!)

Type 'ant help' to see a full list of available Ant tasks.

The current release of Paper Airplane only works on Windows.

