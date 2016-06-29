var React = require('react');
var ReactDOM = require('react-dom');
var MenuItem = require('./MenuItem');
var CheckModule = require('./CheckModule');

var CheckingScreen = React.createClass({
	getInitialState: function(){
	  return {
			checkedStatus: 'NOT_CHECKED'
		};
	},
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

ReactDOM.render(<CheckingScreen />, document.getElementById('content'));
