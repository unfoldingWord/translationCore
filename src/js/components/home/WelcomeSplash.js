import React, { Component } from 'react';
import { Button } from 'react-bootstrap'

class WelcomeSplash extends Component {
  render() {
    return (
      <div style={{height: '90vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <img src="../../images/TC_Icon.png" />
        <h1>Welcome to translationCore!</h1>
        <Button bsStyle="darkGrey" onClick={this.props.actions.toggleWelcomeSplash}>Get Started!</Button>
      </div>
    );
  }
}

export default WelcomeSplash;
