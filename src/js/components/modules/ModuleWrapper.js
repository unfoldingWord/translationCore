/**
* @author Evan "He who washes the mugs" Wiederspan
* @description This module is meant to be the direct parent for the check
module. When the user switches to a new check type, this module will receieve the
event from the CheckStore and automatically swap out the check module for the new one
*/
var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');
var CheckStore = require('../../stores/CheckStore.js');
var CheckActions = require('../../actions/CheckActions.js');
// TODO: Require all components


class ModuleWrapper extends React.Component {
  constructor() {
    super();
    this.state = {
      curCheck: "CheckModule" // TODO: pull a default from somewhere else?
    };
  }

  render() {
    var CheckModule = require("./" + this.state.curCheck);
    return (
      <CheckModule />
    );
  }

  componentWillMount() {
    CheckStore.addChangeListener(this.updateCheckType.bind(this));
  }

  componentWillUnmount() {
    CheckStore.removeChangeListener(this.updateCheckType);
  }

  updateCheckType() {
    console.log("Changing Type");
    let newCheckType = CheckStore.getCurrentCheckType();
    if (newCheckType == this.state.curCheck) {
      return;
    }
    let newCheckModule;
    try {
      newCheckModule = require('./' + newCheckType);
    }
    catch (e) {
      console.log("Error: could not load module ./" + newCheckType);
      return;
    }
    this.setState({
      curCheck: newCheckType
    });
  }
}

module.exports = ModuleWrapper;
