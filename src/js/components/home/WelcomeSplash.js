import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import packagefile from '../../../../package.json';

class WelcomeSplash extends Component {
  render() {
    return (
      <div style={{height: '90vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <img height="100px" width="90px" src="images/TC_Icon.png" />
        <h3 style={{fontWeight: "bold", marginTop: "40px"}}>Welcome to translationCore!</h3>
        <div style={{margin: "10px 0 50px", fontSize: "18px"}}>Version <span>{packagefile.version}</span></div>
        <Button
          bsStyle="prime"
          onClick={this.props.actions.toggleModal}>
          Get Started!
        </Button>
      </div>
    );
  }
}

export default WelcomeSplash;
