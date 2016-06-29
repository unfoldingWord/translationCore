var Button = require('react-bootstrap/lib/Button.js');
var React = require('react');
var ReactDOM = require('react-dom');

var NextButton = React.createClass({

  render: function() {
    return (
        <Button className="btn-success">Save and Continue &nbsp;<span className="glyphicon glyphicon-arrow-right"/></Button>
    );
  }
});

module.exports = NextButton;