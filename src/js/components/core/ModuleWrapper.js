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

const api = window.ModuleApi;

class ModuleWrapper extends React.Component {
  render() {
    debugger;
    console.log(this.props)
    return (
      <div>
        {this.props.checkModule}
      </div>
    );
  }
}

module.exports = ModuleWrapper;
