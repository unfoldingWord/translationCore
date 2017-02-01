/**
* @author Evan "He who washes the mugs" Wiederspan
* @description This module is meant to be the direct parent for the check
module. When the user switches to a new check type, this module will receieve the
event from the CheckStore and automatically swap out the check module for the new one
*/
var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');
var CoreStore = require('../../stores/CoreStore.js');
var RecentProjectsContainer = require('../../containers/RecentProjectsContainer');
var SwitchCheck = require('./SwitchCheck');
var Upload = require('./UploadMethods');
const path = require('path-extra');
const fs = require(window.__base + 'node_modules/fs-extra');
const defaultSave = path.join(path.homedir(), 'translationCore');
const {shell} = require('electron');

const api = window.ModuleApi;

class ModuleWrapper extends React.Component {
  render() {
    var mainContent;
    if (this.props.mainViewVisible) {
      switch (this.props.type) {
        case 'tools':
          mainContent = <SwitchCheck {...this.props.switchCheckProps} />;
          break;
        case 'recent':
          mainContent = <RecentProjectsContainer />;
          break;
        case 'main':
          var Tool = this.props.mainTool;
          mainContent = <Tool />;
          break;
        default:
          mainContent = (<div> </div>)
          break;
      }
    }
    return (
      <div>
        {mainContent}
      </div>
    );
  }
}

module.exports = ModuleWrapper;
