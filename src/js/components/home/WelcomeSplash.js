import React, { Component } from 'react';
import { Button } from 'react-bootstrap'

class WelcomeSplash extends Component {
  render() {
    return (
      <div style={{height: '90vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <img height="100px" width="90px" src="images/TC_Icon.png" />
        <h3 style={{fontWeight: "bold", margin: "30px"}}>Welcome to translationCore!</h3>
        <Button
          style={{background: "#145396", color: "white", margin: "30px", padding: "10px 70px"}}
          onClick={this.props.actions.toggleHomeView}>
          Get Started!
        </Button>
      </div>
    );
  }
}

export default WelcomeSplash;
