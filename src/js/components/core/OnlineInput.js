/**
 * @description: The file handles the submit box for a git url to be cloned.
 */

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {FormGroup, FormControl, Button, Glyphicon, InputGroup} from 'react-bootstrap';
import {CircularProgress} from 'material-ui';

class OnlineInput extends React.Component {

  render() {
    let {showLoadingCircle, load, onChange} = this.props;
    return (
      <MuiThemeProvider>
        <FormGroup controlId="onlineInput">
          <InputGroup style={{display: "flex", alignItems: "center"}}>
            <FormControl
              type="text"
              style={{width: '400px', borderRadius: '4px'}}
              placeholder="Enter URL"
              onChange={onChange}
            />
            <div style={{width: "60px", display: "flex", justifyContent: "center"}}>
              {showLoadingCircle ?
                  (<CircularProgress size={30} thickness={4} color={"var(--accent-color-dark)"} />) : ""
              }
            </div>
            <Button bsStyle="prime" onClick={load}>
              <Glyphicon glyph="folder-open"/>
              <span style={{marginLeft: '10px'}}>Import</span>
            </Button>
          </InputGroup>
        </FormGroup>
      </MuiThemeProvider>
    );
  }
}

export default OnlineInput;
