
//ErrorModal.js//

//Bootstrap
var Modal = require('react-bootstrap/lib/Modal.js');
var Button = require('react-bootstrap/lib/Button.js');

//Node modules
var React = require('react');

//Hard coded english strings
var CLOSE = "Close";

/*
Requires isShown, glyph, title, message, and buttons 
*/
var ErrorModal = React.createClass({
	getInitialState: function() {
	    return {
	    	isShown: false
	    };
	},

	show: function() {
		if (!this.state.isShown) { //don't trigger an unnecessary rerender
			this.setState({
				isShown: true
			});
		}
	},

	close: function() {
		if (this.state.isShown) {
			this.setState({
				isShown: false
			});
		}
	},

	render: function() {
		return (
			<Modal show={this.state.isShown} onHide={this.close}>
				<Modal.Header>
					<Modal.Title>
						<span>
							{this.props.glyph}
							{' ' + this.props.title}
	    				</span>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{this.props.message}
	    		</Modal.Body>
				<Modal.Footer>
					{this.props.buttons}
					<Button
	    				onClick={this.close}
					>
						{CLOSE}
	    			</Button>
				</Modal.Footer>
			</Modal>
		);
	},

	isShown: function() {
		return this.state.isShown;
	}
});

module.exports = ErrorModal;