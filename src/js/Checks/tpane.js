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
const FileActions = require('../FileActions');

var style = {
  content: {
    paddingLeft: 3,
    paddingRight: 3
  }
};

var Pane = React.createClass({
  render: function() {
    return (
      <div>
          <h3>{this.props.title}</h3>
         <Well>{this.props.content}</Well>
      </div>
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
      <Row style={style.content}>
          <Col style={style.content} xs={3} md={3}><Pane title="Original Language" content={this.state.ol}/></Col>
          <Col style={style.content} xs={3} md={3}><Pane title="Gateway Language" content={this.state.gl}/></Col>
          <Col style={style.content} xs={3} md={3}><Pane title="Target Language" content={this.state.tl}/></Col>
      </Row>
      </Grid>
  );
  }
});
module.exports = TPane;
