import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Logout extends Component {
  render() {
    return (
      <div style={{ height: '100%', marginBottom: 0, width: 350, margin: 'auto' }}>
        <p style={{ fontSize: 16, textAlign: 'center' }}>
          You are logged in as:<br />
          <span style={{ fontWeight: 'bold' }}>{this.props.username}</span><br /><br />
          How would you like to proceed?
        </p>
        <button
          className={"btn-prime"}
          style={{ width: "100%", margin: "40px 0px 10px" }}
          onClick={() => this.props.actions.goToNextStep()}>
          Continue to Project
            </button>
        <button
          className="btn-second"
          style={{ width: "100%", margin: "10px 0px 20px" }}
          onClick={() => this.props.logoutUser()}>
          Log out
            </button>
      </div>
    );
  }
}

Logout.propTypes = {
    username: PropTypes.string,
    actions: PropTypes.shape({
        goToNextStep: PropTypes.func.isRequired
    }),
    logoutUser: PropTypes.func.isRequired
};

export default Logout;