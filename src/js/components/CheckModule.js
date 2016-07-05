var React = require('react');
var ReactDOM = require('react-dom');

var CheckModule = React.createClass({
  render: function() {
    return (
      <div>
        <RetainedButton onCheckedStatusChanged={this.props.onCheckedStatusChanged} />
        <ReplacedButton onCheckedStatusChanged={this.props.onCheckedStatusChanged} />
        <WrongButton onCheckedStatusChanged={this.props.onCheckedStatusChanged} />
        <UncheckButton onCheckedStatusChanged={this.props.onCheckedStatusChanged} />
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

var ReplacedButton = React.createClass({
  handleClick: function() {
    this.props.onCheckedStatusChanged("REPLACED");
  },
  render: function() {
    return (
      <button onClick={this.handleClick}>Replaced</button>
    );
  }
});

var WrongButton = React.createClass({
  handleClick: function() {
    this.props.onCheckedStatusChanged("WRONG");
  },
  render: function() {
    return (
      <button onClick={this.handleClick}>Wrong</button>
    );
  }
});

var UncheckButton = React.createClass({
  handleClick: function() {
    this.props.onCheckedStatusChanged("NOT_CHECKED");
  },
  render: function() {
    return (
      <button onClick={this.handleClick}>Uncheck</button>
    );
  }
});

module.exports = CheckModule;
