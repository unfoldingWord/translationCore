var React = require('react');
var ReactDom = require('react-dom');
var MenuItem = require('./MenuItem');
var CheckModule = require('./CheckModule');

var CheckingScreen = React.creatClass({   // checkecking screen has menu item and check module in it
  getInitialState: function(){
    return {
      checkedStatus:"NOT_CHECKED"// its either , retained,replaced,wrong,
                                 //or not checked
    };
  },
  changeCheckedStatus: function(status){ // changes the status of checked status to the parameter "status"
    this.setState({
      checkedStatus:status
    })
}
  render: function(){
    return(
      <div>
          <MenuItem checkedStatus={this.state.checkedStatus}/>
          <CheckModule onCheckedStatusChanged={this.changedCheckedStatus} />
      </div>
      );
    }
});
ReactDOM.render(<CheckingScreen/>,document.getElementById('content'));
