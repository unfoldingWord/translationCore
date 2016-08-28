/**
* @author Evan "He who washes the mugs" Wiederspan
* @description This module is meant to be the direct parent for the check
module. When the user switches to a new check type, this module will receieve the
event from the CheckStore and automatically swap out the check module for the new one
*/
var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');
var CoreStore = require('../../stores/CoreStore');
var NextButton = require('../core/NextButton');
var PreviousButton = require('../core/PreviousButton');

const api = window.ModuleApi;

class ModuleWrapper extends React.Component {
  constructor() {
    super();
    this.state = {};

    this.updateCheckType = this.updateCheckType.bind(this);
  }

  render() {
    // TODO: should probably return an empty div if this.state.view doesn't exist
    // but for now it has LexicalCheck as default
    if (!this.state.view) {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          'Click the apps button to start checking'
        )
      );
    }
    var CheckModule = this.state.view;
    return React.createElement(
      'div',
      null,
      React.createElement(CheckModule, null),
      React.createElement(
        'div',
        { style: { float: 'left' } },
        React.createElement(PreviousButton, null)
      ),
      React.createElement(
        'div',
        { style: { float: 'right' } },
        React.createElement(NextButton, null)
      )
    );
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.updateCheckType);
  }

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.updateCheckType);
  }

  updateCheckType(params) {
    if (params.currentCheckNamespace) {
      // var newCheckCategory = CoreStore.findCheckCategoryOptionByNamespace(params.currentCheckNamespace);
      var newCheckCategory = api.getModule(params.currentCheckNamespace);
      var newView = newCheckCategory;
      this.setState({
        view: newView
      });
    } else {
      this.setState({
        view: null
      });
    }
  }
}

module.exports = ModuleWrapper;