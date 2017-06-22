import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class UserCard extends Component {

  heading(callback) {
    let link = this.content() ? <a onClick={callback}>Log out</a> : <a></a>
    return (
      <span>Current User {link}</span>
    );
  }

  content() {
    let content;
    let { loggedInUser, userdata } = this.props.reducers.loginReducer;
    if (loggedInUser) {
      content = (
        <div>
          <strong>{userdata.username}</strong>
          <p>{userdata.email}</p>
        </div>
      );
    }
    return content;
  }

  render() {
    let emptyMessage = 'Please log in to continue';
    let emptyButtonLabel = 'Login';
    let emptyButtonOnClick = () => { this.props.actions.goToNextStep() };
    return (
      <TemplateCard
        heading={this.heading(emptyButtonOnClick)}
        content={this.content()}
        emptyMessage={emptyMessage}
        emptyButtonLabel={emptyButtonLabel}
        emptyButtonOnClick={emptyButtonOnClick}
      />
    )
  }
}

export default UserCard
