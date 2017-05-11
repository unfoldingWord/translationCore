import React, { Component } from 'react';
import Door43Login from './Door43Login';
import LocalLogin from './LocalLogin';

class Login extends Component {

  render() {
    return (
      <div style={{display: "flex"}}>
        <div style={{overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--accent-color-dark)", flex: "1", padding: "1rem", height: "520px"}}>
          <LocalLogin {...this.props} />
        </div>
        <div style={{overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--reverse-color)", flex: "1", padding: "1rem", height: "520px"}}>
          <Door43Login {...this.props} />
        </div>
      </div>
    );
  }
}

export default Login;
