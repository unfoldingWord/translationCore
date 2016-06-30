var React = require('react');
var ReactDOM = require('react-dom');
var Tpane = require('./tpane');
var PhraseChecker = require('./PhraseChecker');
const Grid = require('react-bootstrap/lib/Grid.js');
const Col = require('react-bootstrap/lib/Col.js');
const Row = require('react-bootstrap/lib/Row.js');


var CheckModule = React.createClass({
  render: function() {
     var data = this.props.data;
    return (
      <div>
      <Grid fluid>
      <Row>
      <Col className='tpane' xsOffset={1}><Tpane data={data}/></Col>
      </Row>
      <Row>
      <Col className='checkModule' xsOffset={1}><PhraseChecker data={data}/></Col>
      </Row>
      </Grid>
      </div>
    );
  }
});
module.exports = CheckModule;
