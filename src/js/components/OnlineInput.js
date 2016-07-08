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
    loadOnline(link);
    this.state.value = "";
  },

  submitViaEnter: function(e) {
    if (e.keyCode === 13) {
      this.submitLink();
    } else {
      return;
    }
  },

  render: function() {
    return (
        <FormGroup controlId="onlineInput">
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
