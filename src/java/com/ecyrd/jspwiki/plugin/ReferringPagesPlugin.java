/* 
    JSPWiki - a JSP-based WikiWiki clone.

    Copyright (C) 2001-2002 Janne Jalkanen (Janne.Jalkanen@iki.fi)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 2.1 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
package com.ecyrd.jspwiki.plugin;

import org.apache.log4j.Category;
import com.ecyrd.jspwiki.*;
import java.util.*;
import java.text.SimpleDateFormat;
import java.io.StringReader;
import java.io.IOException;

/**
 *  Displays the pages referring to the current page.
 *
 *  Parameters: max: How many items to show.<BR>
 *              extras: How to announce extras.<BR>
 *
 *  @author Janne Jalkanen
 */
public class ReferringPagesPlugin
    extends AbstractReferralPlugin
{
    private static Category log = Category.getInstance( ReferringPagesPlugin.class );

    public static final String PARAM_MAX      = "max";
    public static final String PARAM_EXTRAS   = "extras";

    public String execute( WikiContext context, Map params )
        throws PluginException
    {
        ReferenceManager refmgr = context.getEngine().getReferenceManager();
        WikiPage         page   = context.getPage();

        if( page != null )
        {
            Collection   links  = refmgr.findReferrers( page.getName() );
            String       wikitext;

            super.initialize( context, params );

            int items = TextUtil.parseIntParameter( (String)params.get( PARAM_MAX ), ALL_ITEMS );
            String extras = (String)params.get( PARAM_EXTRAS );
            if( extras == null )
            {
                extras = "...and %d more\\\\";
            }

            log.debug( "Fetching referring pages for "+context.getPage().getName()+
                       " with a max of "+items);
        
            if( links != null && links.size() > 0 )
            {
                wikitext = wikitizeCollection( links, m_separator, items );

                if( items < links.size() && items > 0 )
                {
                    extras = TextUtil.replaceString( extras, "%d", 
                                                     ""+(links.size()-items) );
                    wikitext += extras;
                }
            }
            else
            {
                wikitext = "...nobody";
            }

            return makeHTML( context, wikitext );
        }

        return "";
    }

}
