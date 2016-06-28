var Col = require('react-bootstrap/lib/Col.js');
var Row = require('react-bootstrap/lib/Row.js');
var Grid = require('react-bootstrap/lib/Grid.js');
var React = require('react');
var ReactDOM = require('react-dom');

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
      <Col md={4} xs={4}>
          <h3 style={style.header}> {this.props.title} </h3>
          <div style={style.content}>{this.props.content}</div>
      </Col>
    );
  }

});

var TPane = React.createClass({

  render: function() {
    return (
      <Grid>
        <Row>
          <Pane title = "Original Language" content = {this.props.original}/>
          <Pane title = "Gateway Language" content = {this.props.gateway}/>
          <Pane title = "Target Language" content = {this.props.target}/>
          </Row>
      </Grid>
  );
  }
});

module.exports = TPane;
window.TPane = TPane;
