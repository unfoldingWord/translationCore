/**
* @author Evan "He who washes the mugs" Wiederspan
* @description This module is meant to be the direct parent for the check
module. When the user switches to a new check type, this module will receieve the
event from the CheckStore and automatically swap out the check module for the new one
*/
var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');
var CoreStore = require('../../stores/CoreStore');

const api = window.ModuleApi;

class ModuleWrapper extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    // TODO: should probably return an empty div if this.state.view doesn't exist
    // but for now it has LexicalCheck as default
    if(!this.state.view) {
      var CheckModule = require(window.__base + "modules/lexical_check_module/View.js");
      return <CheckModule />;
    }
    var CheckModule = this.state.view;
    return (
      <CheckModule />
    );
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.updateCheckType.bind(this));
  }

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.updateCheckType.bind(this));
  }

  updateCheckType(params) {
    var newCheckCategory = CoreStore.findCheckCategoryOptionByNamespace(params.currentCheckNamespace);
    var newView = newCheckCategory.view;
    this.setState({
      view: newView
    });
  }
}

module.exports = ModuleWrapper;
