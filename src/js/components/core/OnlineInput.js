/**
 * @description: The file handles the submit box for a git url to be cloned.
 */

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {FormGroup, FormControl, Glyphicon, InputGroup} from 'react-bootstrap';
import {CircularProgress} from 'material-ui';

class OnlineInput extends React.Component {

  render() {
    let {load, onChange, importLink} = this.props;
    return (
      <MuiThemeProvider>
        <FormGroup controlId="onlineInput">
          <InputGroup style={{display: "flex", alignItems: "center"}}>
            <FormControl
              type="text"
              style={{width: '400px', borderRadius: '4px'}}
              placeholder="Enter URL"
              value={importLink}
              onChange={onChange}
            />
            <button className="btn-prime" disabled={!importLink} onClick={load}>
              <span style={{marginLeft: '10px'}}>Import & Select</span>
            </button>
          </InputGroup>
        </FormGroup>
      </MuiThemeProvider>
    );
  }
}

export default OnlineInput;
