var React = require('react');
var CheckStore = require('../../stores/CheckStore.js');
var CheckActions = require('../../actions/CheckActions.js');

/*
Abstract class for Check Modules:

Check Modules -- like LexicalCheckModule -- should extend AbstractCheckModule.
Subclasses will call getCurrentCheck to get this.state.currentCheck. You usually
won't have to mess with this file.
*/

class AbstractCheckModule extends React.Component {

  constructor() {
    super();

    this.state = {currentCheck: CheckStore.getCurrentCheck()};
    this.refreshCurrentCheck = this.refreshCurrentCheck.bind(this);
  }

  // Listens for emits coming from CheckStore
  componentWillMount() {
    CheckStore.addChangeListener(this.refreshCurrentCheck);
  }

  componentWillUnmount() {
    CheckStore.removeChangeListener(this.refreshCurrentCheck);
  }

  // Gets the current check from CheckStore and saves it in this.state
  refreshCurrentCheck() {
    this.setState({currentCheck: CheckStore.getCurrentCheck()});
  }

  // Returns the current check in this.state
  // This is what subclasses should call to get data
  getCurrentCheck() {
    return this.state.currentCheck;
  }

};

module.exports = AbstractCheckModule;
