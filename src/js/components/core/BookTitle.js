/**
 * @description: This file builds the BookTitle
 * @author: Ian Hoegen
 ******************************************************************************/
const React = require('react');

const BookTitle = React.createClass({
  render: function() {
    return (
      <h4>{this.props.title}</h4>
    );
  }
});

module.exports = BookTitle;
