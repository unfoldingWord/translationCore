var React = require('react');

var MenuItem = require('./MenuItem');
var CheckModule = require('./CheckModule');

module.exports = React.createClass({   // checkecking screen has menu item and check module in it
  getInitialState: function() {
    return {
      checkedStatus: "NOT_CHECKED"// its either , retained,replaced,wrong,
                                 // or not checked
    };
  },

  // changes the status of checked status to the parameter "status"
  changeCheckedStatus: function(status) {
    this.setState({
      checkedStatus: status
    });
  },

  render: function() {
    return (
      <div>
          <MenuItem checkedStatus={this.state.checkedStatus} />
          <CheckModule onCheckedStatusChanged={this.changeCheckedStatus} />
      </div>
    );
  }
});
