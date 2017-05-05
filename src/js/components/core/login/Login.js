import React, { Component } from 'react';
import Door43Login from './Door43Login'

class Login extends Component {

  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td style={{backgroundColor: "#000"}}>

              </td>
              <td>
                <Door43Login {...this.props} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default Login;
