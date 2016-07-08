const React = require('react');

const Col = require('react-bootstrap/lib/Col.js');
const Well = require('react-bootstrap/lib/Well.js');

const style = require('./Style');

const Book = require('./Book');

const Pane = React.createClass({
  render: function() {
    return (
      <Col md={4} sm={4} xs={12}>
        <h3 style={style.pane.header}>{this.props.title}</h3>
          <Well style={style.pane.content}>
            <Book input={this.props.content} />
          </Well>
      </Col>
    );
  }
});

module.exports = Pane;
