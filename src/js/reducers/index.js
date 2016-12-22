/**
 * @author Ian Hoegen
 * @description: This serves as the centralized reducers location. Actions will
 *               reference here when looking for business logic
 **********************************************************************************/
const Settings = require('./Settings.js');

module.exports = {
  'SETTINGS_UPDATE': Settings
};
