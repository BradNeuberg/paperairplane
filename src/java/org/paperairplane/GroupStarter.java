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

/** This class will start any groups a user has created before.  It does this by
 *  simply finding what subdirectories are in the 'wiki' directory and using the
 *  name of each directory as the name of the group to republish.
 * 
 *  It also creates a new group with the newGroup method.
 */
public class GroupStarter {
    protected String wikiPath;
    
    /** @param wikiPath The path to where the wiki directory is located, such as "." if it is in the
     *  current directory. 
     */
    public GroupStarter(String wikiPath) {
        this.wikiPath = wikiPath;
    }
    
    public void startExistingGroups() throws Exception {
        String[] existingGroups = getExistingGroups();
        
        for (int i = 0; i < existingGroups.length; i++)
            newGroup(existingGroups[i], false);
    }
    
    public Group newGroup(String groupName, boolean doTimeout) throws Exception {
        Group g = new Group(groupName);
        g.start();
        
        // FIXME: We need to get a signal back from the thread rather than timing out here for awhile.
        // This is a hack
        if (doTimeout)
            Thread.currentThread().sleep(5000);
        return g;
    }
    
    protected String[] getExistingGroups() throws Exception {
        File wikiDir = new File(wikiPath + File.separator + "wiki");
        
        if (wikiDir.exists() == false)
            wikiDir.mkdir();
        
        if (wikiDir.isDirectory() == false)
            throw new IOException(wikiDir + " must be a directory");
        
        return wikiDir.list();
    }
}
