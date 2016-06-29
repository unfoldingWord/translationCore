var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var Button = require('react-bootstrap/lib/Button.js');
var Grid = require('react-bootstrap/lib/Grid.js');
var Row = require('react-bootstrap/lib/Row.js');
var Col = require('react-bootstrap/lib/Col.js');
var React = require('react');
var ReactDOM = require('react-dom');
const FileUpload = require('./fileupload');

var CommentBox = React.createClass({

  render: function () {
    return (
      <div>
        <Grid>
          <Row>
            <h1>New Project</h1>
            <FormGroup>
              <FormControl id="projectNameBox" componentClass="input" placeholder="Project Name" />
            </FormGroup>
          </Row>
          <Row>
            <Col md={4}>
              Original Language Text
              <FileUpload />
            </Col>
            <Col md={4}>
              Gateway Language Text
              <FileUpload />
            </Col>
            <Col md={4}>
              Target Language Text
              <FileUpload />
            </Col>
          </Row>
          <Row>
          <Button>OK</Button>
          </Row>
        </Grid>
      </div>
    );
  }
});

module.exports = CommentBox;