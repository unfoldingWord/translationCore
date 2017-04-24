import React, { Component } from 'react';

class WelcomeSplash extends Component {
  render() {
    return (
      <div>
        <h1 onClick={this.props.actions.togglewWelcomeSplash} style={{cursor: "pointer"}}>Get started!</h1>
      </div>
    );
  }
}

export default WelcomeSplash;
