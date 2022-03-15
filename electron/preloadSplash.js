// Preload Script - set variables to be used by splash screen

console.log(`started preloadSplash`);

const { contextBridge } = require('electron');

console.log(`require finished`);

const {
  BUILD,
  tcVersion,
} = process.env;

// values to share with client
const envValues = {
  BUILD,
  tcVersion,
};

contextBridge.exposeInMainWorld('envVars', envValues);

console.log(`finished preloadSplash`);

