import React, { Component } from 'react'
import TemplateCard from './TemplateCard'

class UserCard extends Component {

  heading() {
    return (<span>Current User <a>Log out</a></span>);
  }

  content() {
    let content = (
      <div>
        <strong>username</strong>
        <p>email@address.com</p>
      </div>
    );
    content = (
      <div style={{ textAlign: 'center' }}>
        Please log in to continue<br/>
        <button>Login</button>
      </div>
    );
    return content;
  }

  render() {
    return (
      <TemplateCard heading={this.heading()} content={this.content()} />
    )
  }
}

export default UserCard
