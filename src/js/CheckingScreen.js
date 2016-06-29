var React = require('react');
var ReactDOM = require('react-dom');
var MenuItem = require('./MenuItem');

var CheckingScreen = React.createClass({
	getInitialState: function(){
	  return {
			checkedStatus: 'NOT_CHECKED'
		};
	},
	render: function() {
  	return (
			<div>
				<MenuItem checkedStatus={this.state.checkedStatus} />
			</div>
		);
	}
});

ReactDOM.render(<CheckingScreen />, document.getElementById('content'));
