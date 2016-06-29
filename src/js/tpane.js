/**
 * @author Ian Hoegen
 * @description This component displays the Original Language, Gateway Language,
 *              and the Target Language. It takes it's input from uploads.
 ******************************************************************************/
const Col = require('react-bootstrap/lib/Col.js');
const Row = require('react-bootstrap/lib/Row.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Well = require('react-bootstrap/lib/Well.js');
const React = require('react');
const FileActions = require('./FileActions');

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
var TPane = React.createClass({
  getInitialState: function() {
    return ({
      ol: "",
      tl: "",
      gl: ""
    });
  },
  componentWillMount: function() {
    FileActions.on('changeTL', this.updateTargetLanguage);
  },
  updateTargetLanguage: function(text) {
    this.setState({
      tl: FileActions.storedText
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
