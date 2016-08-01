const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');

const loadOnline = require('./LoadOnline');

const OnlineInput = React.createClass({
  getInitialState: function() {
    return {
      value: ''
    };
  },

  handleChange: function(e) {
    this.setState({value: e.target.value});
  },

  submitLink: function() {
    var link = this.state.value;
    loadOnline(link, this.props.sendFilePath);
  },

  submitViaEnter: function(e) {
    var EnterKey = 13;
    if (e.keyCode === EnterKey) {
      this.submitLink();
    } else {
      return;
    }
  },

  render: function() {
    var main =  {
      width: '100%',
      color: '#ffffff',
      height: '200px',
      fontSize: '25px'
    }

    return (
        <FormGroup controlId="onlineInput" style={main}>
          <FormControl type="text" value={this.state.value} placeholder="Enter URL" onChange={this.handleChange} onKeyDown={this.submitViaEnter} />
          <Button bsStyle="primary" onClick={this.submitLink} pullRight>
            Submit
          </Button>
          <FormControl.Feedback />
        </FormGroup>
    );
  }
});

module.exports = OnlineInput;
