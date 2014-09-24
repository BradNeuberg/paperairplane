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
package com.ecyrd.jspwiki;

import java.io.IOException;
import java.util.Properties;
import java.util.Collection;
import java.util.HashMap;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

import org.apache.log4j.Category;

import com.ecyrd.jspwiki.providers.WikiPageProvider;
import com.ecyrd.jspwiki.providers.ProviderException;

/**
 *  Manages the WikiPages.  This class functions as an unified interface towards
 *  the page providers.  It handles initialization and management of the providers,
 *  and provides utility methods for accessing the contents.
 *
 *  @author Janne Jalkanen
 *  @since 2.0
 */
// FIXME: This class currently only functions just as an extra layer over providers,
//        complicating things.  We need to move more provider-specific functionality
//        from WikiEngine (which is too big now) into this class.
public class PageManager
{
    public static final String PROP_PAGEPROVIDER = "jspwiki.pageProvider";
    public static final String PROP_USECACHE     = "jspwiki.usePageCache";
    public static final String PROP_LOCKEXPIRY   = "jspwiki.lockExpiryTime";

    static Category log = Category.getInstance( PageManager.class );

    private WikiPageProvider m_provider;

    private HashMap m_pageLocks = new HashMap();

    /**
     *  The expiry time.  Default is 60 minutes.
     */
    private int     m_expiryTime = 60;

    /**
     *  Creates a new PageManager.
     *  @throws WikiException If anything goes wrong, you get this.
     */
    public PageManager( Properties props )
        throws WikiException
    {
        String classname;

        boolean useCache = "true".equals(props.getProperty( PROP_USECACHE ));

        m_expiryTime = TextUtil.parseIntParameter( props.getProperty( PROP_LOCKEXPIRY ),
                                                   m_expiryTime );

        //
        //  If user wants to use a cache, then we'll use the CachingProvider.
        //
        if( useCache )
        {
            classname = "com.ecyrd.jspwiki.providers.CachingProvider";
        }
        else
        {
            classname = props.getProperty( PROP_PAGEPROVIDER );
        }

        try
        {
            Class providerclass = WikiEngine.findWikiClass( classname, 
                                                            "com.ecyrd.jspwiki.providers" );
            m_provider = (WikiPageProvider)providerclass.newInstance();

            log.debug("Initializing page provider class "+m_provider);
            m_provider.initialize( props );
        }
        catch( ClassNotFoundException e )
        {
            log.error("Unable to locate provider class "+classname,e);
            throw new WikiException("no provider class");
        }
        catch( InstantiationException e )
        {
            log.error("Unable to create provider class "+classname,e);
            throw new WikiException("faulty provider class");
        }
        catch( IllegalAccessException e )
        {
            log.error("Illegal access to provider class "+classname,e);
            throw new WikiException("illegal provider class");
        }
        catch( NoRequiredPropertyException e )
        {
            log.error("Provider did not found a property it was looking for: "+e.getMessage(),
                      e);
            throw e;  // Same exception works.
        }
        catch( IOException e )
        {
            log.error("An I/O exception occurred while trying to create a new page provider: "+classname, e );
            throw new WikiException("Unable to start page provider: "+e.getMessage());
        }        

        //
        //  Start the lock reaper.
        //
        new LockReaper().start();
    }

    /**
     *  Returns the page provider currently in use.
     */
    public WikiPageProvider getProvider()
    {
        return m_provider;
    }

    public Collection getAllPages()
        throws ProviderException
    {
        return m_provider.getAllPages();
    }

    public String getPageText( String pageName, int version )
        throws ProviderException
    {
        return m_provider.getPageText( pageName, version );
    }

    public void putPageText( WikiPage page, String content )
        throws ProviderException
    {
        m_provider.putPageText( page, content );
    }

    /**
     *  Locks page for editing.  Note, however, that the PageManager
     *  will in no way prevent you from actually editing this page;
     *  the lock is just for information.
     *
     *  @return null, if page could not be locked.
     */
    public PageLock lockPage( WikiPage page, String user )
    {
        PageLock lock = null;

        synchronized( m_pageLocks )
        {
            lock = (PageLock) m_pageLocks.get( page.getName() );

            if( lock == null )
            {
                //
                //  Lock is available, so make a lock.
                //
                Date d = new Date();
                lock = new PageLock( page, user, d,
                                     new Date( d.getTime() + m_expiryTime*60*1000L ) );

                m_pageLocks.put( page.getName(), lock );                

                log.debug( "Locked page "+page.getName()+" for "+user);
            }
            else
            {
                log.debug( "Page "+page.getName()+" already locked by "+lock.getLocker() );
                lock = null; // Nothing to return
            }
        }

        return lock;
    }

    /**
     *  Marks a page free to be written again.  If there has not been a lock,
     *  will fail quietly.
     *
     *  @param lock A lock acquired in lockPage().  Safe to be null.
     */
    public void unlockPage( PageLock lock )
    {
        if( lock == null ) return;

        synchronized( m_pageLocks )
        {
            PageLock old = (PageLock)m_pageLocks.remove( lock.getPage().getName() );

            log.debug( "Unlocked page "+lock.getPage().getName() );
        }
    }

    /**
     *  Returns the current lock owner of a page.  If the page is not
     *  locked, will return null.
     *
     *  @return Current lock.
     */
    public PageLock getCurrentLock( WikiPage page )
    {
        PageLock lock = null;

        synchronized( m_pageLocks )
        {
            lock = (PageLock)m_pageLocks.get( page.getName() );
        }

        return lock;
    }

    /**
     *  Returns a list of currently applicable locks.  Note that by the time you get the list,
     *  the locks may have already expired, so use this only for informational purposes.
     *
     *  @return List of PageLock objects, detailing the locks.  If no locks exist, returns
     *          an empty list.
     *  @since 2.0.22.
     */
    public List getActiveLocks()
    {
        ArrayList result = new ArrayList();

        synchronized( m_pageLocks )
        {
            for( Iterator i = m_pageLocks.values().iterator(); i.hasNext(); )
            {
                result.add( i.next() );
            }
        }

        return result;
    }

    public Collection findPages( QueryItem[] query )
    {
        return m_provider.findPages( query );
    }

    public WikiPage getPageInfo( String pageName, int version )
        throws ProviderException
    {
        return m_provider.getPageInfo( pageName, version );
    }

    /**
     *  Gets a version history of page.  Each element in the returned
     *  List is a WikiPage.
     *  <P>
     *  @return If the page does not exist, returns null, otherwise a List
     *          of WikiPages.
     */
    public List getVersionHistory( String pageName )
        throws ProviderException
    {
        if( pageExists( pageName ) )
        {
            return m_provider.getVersionHistory( pageName );
        }
        
        return null;
    }

    public String getProviderDescription()
    {
        return m_provider.getProviderInfo();
    }

    public int getTotalPageCount()
    {
        try
        {
            return m_provider.getAllPages().size();
        }
        catch( ProviderException e )
        {
            log.error( "Unable to count pages: ",e );
            return -1;
        }
    }

    public boolean pageExists( String pageName )
    {
        return m_provider.pageExists( pageName );
    }

    /**
     *  This is a simple reaper thread that runs roughly every minute
     *  or so (it's not really that important, as long as it runs),
     *  and removes all locks that have expired.
     */
    private class LockReaper extends Thread
    {
        public void run()
        {
            while( true )
            {
                try
                {
                    Thread.sleep( 60 * 1000L );

                    synchronized( m_pageLocks )
                    {
                        Collection entries = m_pageLocks.values();

                        Date now = new Date();

                        for( Iterator i = entries.iterator(); i.hasNext(); )
                        {
                            PageLock p = (PageLock) i.next();

                            if( now.after( p.getExpiryTime() ) )
                            {
                                i.remove();

                                log.debug( "Reaped lock: "+p.getPage().getName()+
                                           " by "+p.getLocker()+
                                           ", acquired "+p.getAcquisitionTime()+
                                           ", and expired "+p.getExpiryTime() );
                            }
                        }
                    }
                }
                catch( Throwable t ) {}
            }
        }
    }
}
