import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import Login from './Login';
import LoginDoor43Account from './LoginDoor43Account';
import CreateLocalAccount from './CreateLocalAccount';
import CreateDoor43Account from './CreateDoor43Account';

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { viewType: 'main' };
    this.setView = this.setView.bind(this);
  }

  setView(type) {
    this.setState({ viewType: type });
  }

  getView() {
    switch (this.state.viewType) {
    case 'main': return <Login setView={this.setView} {...this.props} />;
    case 'local': return <CreateLocalAccount setView={this.setView} {...this.props} />;
    case 'create': return <CreateDoor43Account setView={this.setView} {...this.props} />;
    case 'login': return <LoginDoor43Account setView={this.setView} showPopover={this.props.actions.showPopover} {...this.props} />;
    default: return <Login setView={this.setView} {...this.props} />;
    }
  }

  render() {
    return this.getView();
  }
}
LoginContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.any,
};
export default LoginContainer;
