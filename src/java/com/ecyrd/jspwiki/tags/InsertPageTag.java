/* 
    JSPWiki - a JSP-based WikiWiki clone.

    Copyright (C) 2001-2003 Janne Jalkanen (Janne.Jalkanen@iki.fi)

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
package com.ecyrd.jspwiki.tags;

import java.io.IOException;
import javax.servlet.jsp.JspWriter;

import com.ecyrd.jspwiki.WikiEngine;
import com.ecyrd.jspwiki.WikiPage;
import com.ecyrd.jspwiki.providers.ProviderException;

/**
 *  Writes page content in HTML.
 *  <P><B>Attributes</B></P>
 *  <UL>
 *    <LI>page - Page name to refer to.  Default is the current page.
 *    <li>mode - In which format to insert the page.  Can be either "plain" or "html".
 *  </UL>
 *
 *  @author Janne Jalkanen
 *  @since 2.0
 */
public class InsertPageTag
    extends WikiTagBase
{
    public static final int HTML  = 0;
    public static final int PLAIN = 1;

    protected String m_pageName = null;
    private   int    m_mode = HTML;

    public void setPage( String page )
    {
        m_pageName = page;
    }

    public String getPage()
    {
        return m_pageName;
    }

    public void setMode( String arg )
    {
        if( "plain".equals(arg) )
        {
            m_mode = PLAIN;
        }
        else
        {
            m_mode = HTML;
        }
    }

    public final int doWikiStartTag()
        throws IOException,
               ProviderException
    {
        WikiEngine engine = m_wikiContext.getEngine();
        WikiPage   page;

        //
        //  NB: The page might not really exist if the user is currently
        //      creating it (i.e. it is not yet in the cache or providers), 
        //      AND we got the page from the wikiContext.
        //

        if( m_pageName == null )
        {
            page = m_wikiContext.getPage();
            if( !engine.pageExists(page) ) return SKIP_BODY;
        }
        else
        {
            page = engine.getPage( m_pageName );
        }

        if( page != null )
        {
            // FIXME: Do version setting later.
            // page.setVersion( WikiProvider.LATEST_VERSION );

            log.debug("Inserting page "+page);

            JspWriter out = pageContext.getOut();

            switch(m_mode)
            {
              case HTML:
                out.print( engine.getHTML(m_wikiContext, page) );
                break;
              case PLAIN:
                out.print( engine.getText(m_wikiContext, page) );
                break;
            }
        }

        return SKIP_BODY;
    }
}
