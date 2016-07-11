var React = require('react');
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');

var CommentBox = React.createClass({

  render: function() {
    return (
      <FormGroup>
        <FormControl id="commentBox" componentClass="textarea" placeholder="Comments" />
      </FormGroup>
    );
  }
});

module.exports = CommentBox;
