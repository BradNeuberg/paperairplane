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
package com.ecyrd.jspwiki.tags;

import java.io.IOException;
import javax.servlet.jsp.JspWriter;

import com.ecyrd.jspwiki.WikiEngine;
import com.ecyrd.jspwiki.WikiPage;
import com.ecyrd.jspwiki.attachment.Attachment;

/**
 *  Writes a link to a parent of a Wiki page.
 *
 *  <P><B>Attributes</B></P>
 *  <UL>
 *    <LI>page - Page name to refer to.  Default is the current page.
 *    <LI>format - either "anchor" or "url" to output either an <A>... or just the HREF part of one.
 *  </UL>
 *
 *  @author Janne Jalkanen
 *  @since 2.0
 */
public class LinkToParentTag
    extends LinkToTag
{
    public int doWikiStartTag()
        throws IOException
    {
        WikiPage p = m_wikiContext.getPage();

        //
        //  We just simply set the page to be our parent page
        //  and call the superclass.
        //
        if( p instanceof Attachment )
        {
            setPage( ((Attachment)p).getParentName() );
        }

        return super.doWikiStartTag();
    }

}
