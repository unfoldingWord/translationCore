var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var App = React.createClass({
  render: function(){
    return (
      <Row>
        <Col md={6}>
          //Button to go to lexical check module
        </Col>
        <Col md={6}>
          //Button to go phrase check module
        </Col>
      </Row>
    );
  }
});
