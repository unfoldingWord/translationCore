var Button = require('react-bootstrap/lib/Button.js');
var Grid = require('react-bootstrap/lib/Grid.js');
var Row = require('react-bootstrap/lib/Row.js');
var Col = require('react-bootstrap/lib/Col.js');
var NextButton = require('./NextButton');
var SideBar = require('./SideBar');
var CommentBox = require('./CommentBox');
var CheckModule = require('./Checks/CheckModule');
var UploadModal = require('./uploadmodal');
var React = require('react');
var ReactDOM = require('react-dom');

var Root = React.createClass({
  render: function() {
    return (
      <div>
        <UploadModal />
        <Grid fluid>
        <Row>
        <Col className='side' xs={2} md={2}><SideBar data={""}/></Col>
        </Row>
        <Row>
        <Col className='checkSection' xs={10} md={10} xsOffset={2} mdOffset={2}><CheckModule data={""}/></Col>
        </Row>
        <Row className='afterCheck'>
        <Col xs={8} md={8} xsOffset={2} mdOffset={2}>
        <CommentBox data={""}/>
        </Col>
        </Row>

        </Grid>
      </div>
    );
  }
});
module.exports = Root;
