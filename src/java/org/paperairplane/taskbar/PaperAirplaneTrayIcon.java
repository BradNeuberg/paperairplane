package org.paperairplane.taskbar;

import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.net.*;

import org.paperairplane.localproxy.*;

import com.jeans.trayicon.*;

/** Adds an icon on the Windows taskbar tray for Paper Airplane.  Right now the only options on this 
  * menu are an About item and an Exit item.  Internally it also starts up a local proxy 
  * that exposes functionality that can be called by the Paper Airplane toolbar, such as signing into the network,
  * creating a new Paper Airplane Group, etc. */
public class PaperAirplaneTrayIcon {

	private WindowsTrayIcon icon;
	private LocalProxy localProxy;

	public PaperAirplaneTrayIcon(int localProxyPort, String paperairplaneDir) 
									throws Exception {

		// Set callback method to send windows messages through Tray Icon library (see WindowsMessageCallback)
		WindowsTrayIcon.setWindowsMessageCallback(new WindowsMessageCallback());
		
		// Start up the local proxy to respond to commands from the toolbar
		localProxy = new LocalProxy(localProxyPort, paperairplaneDir);

		// Load 16x16 icon gif
		Image image = loadImage("paperairplane16x16.gif");
		icon = new WindowsTrayIcon(image, 16, 16);
		icon.setToolTipText("Paper Airplane");

		// Tray Icon left mouse button event restores the main window (make it visible again/requests focus
		RestoreListener listener = new RestoreListener(false);
		icon.addActionListener(listener);
		icon.setPopup(makePopup());
		icon.setVisible(true);
	}

	// Create the popup menu for each Tray Icon (on right mouse click)
	public TrayIconPopup makePopup() {
		// Make new popup menu
		TrayIconPopup popup = new TrayIconPopup();

		// Add exit item
		TrayIconPopupSimpleItem item = new TrayIconPopupSimpleItem("Exit");
		item.addActionListener(new ExitListener());
		popup.addMenuItem(item);
		return popup;
	}

	// Load a gif image (used for loading the 16x16 icon gifs)
	public Image loadImage(String fileName) {
		String finalName = "/org/paperairplane/taskbar/images/"+fileName;
		URL imageURL = getClass().getResource(finalName);
		return Toolkit.getDefaultToolkit().getImage(imageURL);
	}

	// Main proc
	public static void main(String[] args) {
		try {
			// extract the port to start the proxy on
			int localProxyPort = new Integer(args[0]).intValue();

			// extract the location of our configuration dir
			String paperairplaneDir = args[1];

			String appName = "PaperAirplane";
			// check if there's another instance of our app running by sending a windows message
			// to a hidden icon window "PaperAirplane" - each Tray Icon app has a hidden window that receives
			// the mouse/menu messages for it's Tray Icons
			long result = WindowsTrayIcon.sendWindowsMessage(appName, 1234);
			if (result != -1) {
				// If window exists, there's already an instance of our app running
				// Print message and exit (other app will restore its window when receiving
				// our message - see WindowsMessageCallback
				System.out.println("Already running other instance of "+appName+" (returns: "+result+")");
				return;
			}

			// Init the Tray Icon library given the name for the hidden window
			WindowsTrayIcon.initTrayIcon(appName);
			PaperAirplaneTrayIcon myTrayIcon = new PaperAirplaneTrayIcon(localProxyPort, paperairplaneDir);
		} catch (Exception e) {
			System.out.println("Error: "+e.getMessage());
		}
	}
	
    public void doExit() {	
        System.out.println("Exit selected.");
		// Free all Tray Icon resources - always call this on exit
		WindowsTrayIcon.cleanUp();
        // Exit application
		System.exit(0);
    }

	public static void centerDialog(Window frame) {
		Dimension dialogSize = frame.getSize();
		Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
		frame.setLocation(screenSize.width/2 - dialogSize.width/2,
		                  screenSize.height/2 - dialogSize.height/2);
	}    	
	
	// Callback listener handles incomming windows messages. In this demo, a windows message is send when the
	// user tries to start a second instance of the demo app. You can try this one by opening two MS-DOS prompts
	// and say in each one "java org.paperairplane.trayicon.PaperAirplaneTrayIcon"
	// MS-DOS 1:
	// 	C:\TrayIcon>java org.paperairplane.trayicon.PaperAirplaneTrayIcon
	//	...
	//	Other instance started (parameter: 1234)
	//
	// MS-DOS 2:
	// 	C:\TrayIcon>java org.paperairplane.trayicon.PaperAirplaneTrayIcon
	// 	Already running other instance of PaperAirplaneTrayIcon (returns: 4321)
	private class WindowsMessageCallback implements TrayIconCallback {

		public int callback(int param) {
			// Param contains the integer value send with sendWindowsMessage(appName, param)
			System.out.println("Other instance started (parameter: "+param+")");
			//setVisible(true);
			//requestFocus();
			// Return integer value to other process
			return 4321;
		}

	}

	// Callback listener handles exit button / exit popup menu
	private class ExitListener implements ActionListener {

		public void actionPerformed(ActionEvent evt) {
		    doExit();
		}

	}

	// Callback listener handles restore (click left on any icon / show popup menu)
	private class RestoreListener implements ActionListener {

        protected boolean from_menu;

        public RestoreListener(boolean fromMenu) {
            from_menu = fromMenu;
        }

		public void actionPerformed(ActionEvent evt) {
			if (from_menu) System.out.println("Restore selected..");
			else System.out.println("Tray icon button pressed..");
			// Make main window visible if it was hidden
			//setVisible(true);
			// Request input focus
			//requestFocus();
		}

	}
	
	// Callback listener handles restore (click left on any icon / show popup menu)
	private class ChangeMenuListener implements ActionListener {

        protected TrayIconPopupCheckItem m_Item;
        protected int m_Change;

        public ChangeMenuListener(TrayIconPopupCheckItem item, int change) {
            m_Item = item;
            m_Change = change;
        }

		public void actionPerformed(ActionEvent evt) {
		    TrayIconPopupCheckItem source = (TrayIconPopupCheckItem)evt.getSource();
			boolean value = source.getCheck();
			/*switch (m_Change) {
			    case ENABLE_ITEM:
			        m_Item.setEnabled(value); break;
			    case BOLD_ITEM:
			        m_Item.setDefault(value); break;
			    case CHECK_ITEM:
			        m_Item.setCheck(value); break;
			}*/
		}
	}		
}
