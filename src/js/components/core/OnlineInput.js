/**
 *@author: Ian Hoegen
 *@description: The file handles the submit box for a git url to be cloned.
 ******************************************************************************/
const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');

var _this;

class OnlineInput extends React.Component {
  constructor() {
    super();
    _this = this;
    _this.searchValue = "";
  }
  handleChange(e) {
    _this.searchValue = e.target.value
    _this.props.getLink(e.target.value);
  }

  submitViaEnter(e) {
    _this.props.getLink(_this.searchValue);
    var EnterKey = 13;
    if (e.keyCode === EnterKey) {
      _this.props.submit();
    } else {
      return;
    }
  }

  render() {
    var main = {
      width: '100%',
      color: '#ffffff',
      height: '200px',
      fontSize: '25px'
    };
    return (
        <FormGroup controlId="onlineInput" style={main}>
          <FormControl type="text"
          placeholder="Enter URL"
          onChange={_this.handleChange}
          onKeyDown={_this.submitViaEnter} />
          <FormControl.Feedback />
        </FormGroup>
    );
  }
}

module.exports = OnlineInput;
