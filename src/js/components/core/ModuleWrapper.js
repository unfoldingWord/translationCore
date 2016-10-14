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
var RecentProjects = require('./RecentProjects');
var SwitchCheckModal = require('./SwitchCheckModal');

const api = window.ModuleApi;

class ModuleWrapper extends React.Component {
  constructor() {
    super();
    this.state = {};

    this.updateCheckType = this.updateCheckType.bind(this);
  }

  render() {
    // TODO: should probably return an empty div if this.state.view doesn't exist
    // but for now it has TranslationWords Check as default
    if(!this.state.view) {
      var projects;
      if (this.state.showApps) {
        projects = <SwitchCheckModal.Component />
      } else if (!api.getDataFromCommon('saveLocation') || !api.getDataFromCommon('tcManifest')) {
        projects = <RecentProjects.Component onLoad={() => {
          this.state.showApps = true;
        }}/>;
      } else {
        this.state.showApps = true;
        projects = <SwitchCheckModal.Component />
      }
      return(
        <div>
          {projects}
        </div>
      );
    }
    var CheckModule = this.state.view;
    return (
      <div>
        <CheckModule />
        <div style={{float: 'left'}}>
          <PreviousButton />
        </div>
        <div style={{float: 'right'}}>
          <NextButton />
        </div>
      </div>
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
    }
    else {
      this.setState({
        view: null
      });
    }
  }
}

module.exports = ModuleWrapper;
