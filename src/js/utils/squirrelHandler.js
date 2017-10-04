import { app } from 'electron';

/**
 * Handles Squirrel events.
 * If an event is handled the application will shut down.
 * @return {boolean}
 */
const handleSquirrelEvent = () => {
    if(process.platform !== 'win32') {
        return false;
    }


    const squirrelEvent = process.argv[1];
    switch(squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
        case '--squirrel-obsolete':
        case '--squirrel-uninstall':
            app.quit();
            return true;
        default:
            return false;
    }
};

export default handleSquirrelEvent;