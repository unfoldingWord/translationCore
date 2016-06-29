const Col = require('react-bootstrap/lib/Col.js');
const Row = require('react-bootstrap/lib/Row.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const React = require('react');
const ManifestStore = require('./manifeststore');

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
  getInitialState: function() {
    return ({
      ol: "",
      tl: "",
      gl: ""
    });
  },
  componentWillMount: function() {
    ManifestStore.on('change', this.updateTargetLanguage);
  },
  updateTargetLanguage: function(text) {
    this.setState({
      tl: ManifestStore.storedText
    });
  },
  render: function() {
    return (
      <Grid>
        <Row>
          <Pane title = "Original Language" content = {this.state.ol}/>
          <Pane title = "Gateway Language" content = {this.state.gl}/>
          <Pane title = "Target Language" content = {this.state.tl}/>
          </Row>
      </Grid>
  );
  }
});
module.exports = TPane;
