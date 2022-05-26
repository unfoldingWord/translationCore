// Preload Script - set variables to be used by splash screen

console.log(`started preloadSplash`);

process.once('loaded', () => {
  console.log(`preloadSplash loaded`);
  const {
    BUILD,
    tcVersion,
  } = process.env;

  // values to share with client
  const envValues = {
    BUILD,
    tcVersion,
  };

  try {
    const { contextBridge } = require('electron');

    console.log(`require electron finished`);

    contextBridge.exposeInMainWorld('envVars', envValues);

    console.log(`finished preloadSplash: BUILD=${BUILD}`);
  } catch (e) {
    console.log(`require electron failed`);
  }
});
