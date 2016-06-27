/**
 *@author: Ian Hoegen
 *@description: The JSON outlines a template for the menu, and menu items can
 *              be added from here.
 ******************************************************************************/
 const {remote} = require('electron');
 const {Menu} = remote;
 var template = [
   {
     label: 'Edit',
     submenu: [
       {
         label: 'Cut',
         accelerator: 'CmdOrCtrl+X',
         role: 'cut'
       },
       {
         label: 'Copy',
         accelerator: 'CmdOrCtrl+C',
         role: 'copy'
       },
       {
         label: 'Paste',
         accelerator: 'CmdOrCtrl+V',
         role: 'paste'
       },
       {
         label: 'Delete',
         role: 'delete'
       },
       {
         label: 'Select All',
         accelerator: 'CmdOrCtrl+A',
         role: 'selectall'
       }
     ]
   },
   {
     label: 'View',
     submenu: [
       {
         label: 'Reload',
         accelerator: 'CmdOrCtrl+R',
         click(item, focusedWindow) {
           if (focusedWindow) focusedWindow.reload();
         }
       },
       {
         label: 'Toggle Full Screen',
         accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
         click(item, focusedWindow) {
           if (focusedWindow)
             focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
         }
       },
       {
         label: 'Toggle Developer Tools',
         accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl' +
        '+Shift+I',
         click(item, focusedWindow) {
           if (focusedWindow)
             focusedWindow.webContents.toggleDevTools();
         }
       }
     ]
   },
   {
     label: 'Window',
     role: 'window',
     submenu: [
       {
         label: 'Minimize',
         accelerator: 'CmdOrCtrl+M',
         role: 'minimize'
       },
       {
         label: 'Close',
         accelerator: 'CmdOrCtrl+W',
         role: 'close'
       }
     ]
   },
   {
     label: 'Help',
     role: 'help',
     submenu: [
       {
         label: 'Learn More',
         click() {
           require('electron').shell.openExternal('https://github.com/WycliffeAssociates/8woc/');
         }
       }
     ]
   }
 ];
 var menu = Menu.buildFromTemplate(template);
 Menu.setApplicationMenu(menu);
