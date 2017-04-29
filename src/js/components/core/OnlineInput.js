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
    console.log(showLoadingCircle)
    return (
      <MuiThemeProvider>
        <FormGroup controlId="onlineInput">
          <InputGroup style={{width: '60%', color: '#ffffff'}}>
            <FormControl
              type="text"
              style={{width: '78%', borderRadius: '4px'}}
              placeholder="Enter URL"
              onChange={onChange}
            />
            <Button bsStyle="primary" onClick={load}>
              <Glyphicon glyph="folder-open"/>
              <span style={{marginLeft: '15px', fontWeight: 'bold'}}>Import</span>
            </Button>
          </InputGroup><br />
          {showLoadingCircle ?
            (<CircularProgress size={70} thickness={8} color={"#19579E"} />) : ""
          }
        </FormGroup>
      </MuiThemeProvider>
    );
  }
}

export default OnlineInput;
