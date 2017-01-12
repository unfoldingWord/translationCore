/**
* @author Evan "He who washes the mugs" Wiederspan
* @description This module is meant to be the direct parent for the check
module. When the user switches to a new check type, this module will receieve the
event from the CheckStore and automatically swap out the check module for the new one
*/
var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');
var CoreStore = require('../../stores/CoreStore.js');
var RecentProjects = require('./RecentProjects');
var SwitchCheck = require('./SwitchCheck');
var Upload = require('./UploadMethods');
const path = require('path-extra');
const fs = require(window.__base + 'node_modules/fs-extra');
const defaultSave = path.join(path.homedir(), 'translationCore');
const {shell} = require('electron');

const api = window.ModuleApi;

class ModuleWrapper extends React.Component {
  render() {
    var Tool = this.props.view;
    return (
      <div>
      { this.props.view ? <Tool /> : null}
      </div>
    );
  }
}

module.exports = ModuleWrapper;
