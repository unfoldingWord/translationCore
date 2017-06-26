import React, { Component } from 'react'
import Login from '../../components/home/usersManagement/Login';
import LoginDoor43Account from '../../components/home/usersManagement/LoginDoor43Account';
import CreateLocalAccount from '../../components/home/usersManagement/CreateLocalAccount';
import CreateDoor43Account from '../../components/home/usersManagement/CreateDoor43Account';

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewType: 'main'
    };
    this.setView = this.setView.bind(this);
  }

  setView(type) {
    this.setState({
      viewType: type
    })
  }

  getView() {
    switch (this.state.viewType) {
      case 'main': return <Login setView={this.setView} {...this.props} />;
      case 'local': return <CreateLocalAccount setView={this.setView} {...this.props} />;
      case 'create': return <CreateDoor43Account setView={this.setView} {...this.props} />;
      case 'login': return <LoginDoor43Account setView={this.setView} {...this.props} />;
      default: return <Login setView={this.setView} {...this.props} />;
    }
  }

  render() {
    return this.getView();
  }
}

export default LoginContainer;
