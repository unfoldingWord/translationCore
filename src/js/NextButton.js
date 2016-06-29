var React = require('react');
var Button = require('react-bootstrap/lib/Button.js');

var NextButton = React.createClass({

  render: function() {
    return (
        <Button className="btn-success">Save and Continue &nbsp;<span className="glyphicon glyphicon-arrow-right"/></Button>
    );
  }
});

module.exports = NextButton;