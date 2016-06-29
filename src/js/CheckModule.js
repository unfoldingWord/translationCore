var React = require('react');
var ReactDOM = require('react-dom');

var CheckModule = React.createClass({
  render: function() {
    return (
      <div>
        <RetainedButton onCheckedStatusChanged={this.props.onCheckedStatusChanged} />
      </div>
    );
  }
});

var RetainedButton = React.createClass({
  handleClick: function() {
    this.props.onCheckedStatusChanged("RETAINED");
  },
  render: function() {
    return (
      <button onClick={this.handleClick}>Retained</button>
    );
  }
});

module.exports = CheckModule;
