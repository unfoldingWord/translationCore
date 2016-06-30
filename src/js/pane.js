const Col = require('react-bootstrap/lib/Col.js');
const Well = require('react-bootstrap/lib/Well.js');
const React = require('react');

var style = {
  header: {
    textAlign: 'center'
  },
  content: {
    overflowY: 'scroll',
    width: '100%',
    height: '250px'
  }
};

var Pane = React.createClass({
  render: function() {
    return (
      <Col md={4} sm={4} xs={12}>
          <h3 style={style.header}> {this.props.title} </h3>
          <Well style={style.content}>
          <div>{this.props.content}</div>
          </Well>
      </Col>
    );
  }
});

module.exports = Pane;
