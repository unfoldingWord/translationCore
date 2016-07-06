/**
* @author Evan "He who washes the mugs" Wiederspan
* @description This module is meant to be the direct parent for the check
module. When the user switches to a new check type, this module will receieve the
event from the CoreStore and automatically swap out the check module for the new one
*/
var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');
var CoreStore = require('../stores/CoreStore.js');
var CoreActions = require('../actions/CoreActions.js');
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
    CoreStore.addChangeListener(this.updateCheckType.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateCheckType);
  }

  updateCheckType() {
    console.log("Changing Type");
    let newCheckType = CoreStore.getCurrentCheckType();
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
