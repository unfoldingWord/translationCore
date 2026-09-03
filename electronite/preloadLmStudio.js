// Preload Script - set variables to be used by splash screen

const { ipcRenderer } = require('electronite');

console.log(`started preloadLmStudio`);

window.lmStudio = { query: (query, options = {}) => ipcRenderer.invoke('lm-studio:query', query, options) };
