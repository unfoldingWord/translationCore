import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

let installScreen;

const run = (args, done) => {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    spawn(updateExe, args, {
        detached: true
    }).on('close', done);
};

const createInstallScreen = () => {
    installScreen = new BrowserWindow({
        width: 600,
        height: 200,
        resizable: false,
        autoHideMenuBar: true,
        icon: './images/TC_Icon.png',
        frame: false,
        center: true,
        show: false
    });

    // installScreen.loadURL(`file://${__dirname}/html/splash.html`);

    installScreen.on('closed', function() {
        installScreen = null;
    });
}

/**
 * Handles Squirrel events.
 * If an event is handled the application will shut down.
 * Therefore when you call this method you should skip the rest of startup
 * if the return is truthy.
 * @return {boolean}
 */
const handleSquirrelEvent = () => {
    if(process.platform !== 'win32') {
        return false;
    }
    createInstallScreen();
    installScreen.show();

    const target = path.dirname(process.execPath);
    const squirrelEvent = process.argv[1];
    switch(squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            createInstallScreen();
            installScreen.show();
            run(['--createShortcut=' + target], app.quit);
            return true;
        case '--squirrel-uninstall':
            run(['--removeShortcut=' + target], app.quit);
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
        default:
            return false;
    }
};

export default handleSquirrelEvent;