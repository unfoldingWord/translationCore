import React, { Component } from 'react';
import { TextField } from 'material-ui';

class LocalUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            localUsername: ""
        };
    }

    render() {
        return (
            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection:'column' }}>
                <div style={{ fontSize: 25, fontWeight: 100 }}>New Local User</div>
                <div>
                Username
                <br/>
                    <input
                        onChange={(e) => this.setState({ localUsername: e.target.value })}
                        value={this.state.localUsername}
                        style={{ border: '1px solid black', outline: 'none', borderRadius:2 }}></input>
                </div>
            </div>
        );
    }
}

export default LocalUser;