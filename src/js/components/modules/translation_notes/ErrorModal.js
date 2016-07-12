
//ErrorModal.js//

//Bootstrap
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');

//Node modules
const React = require('react');

//Hard coded english strings
const CLOSE = "Close";

/**
 * @description: An Error modal class that will animate and fall from the top of the screen
 * and disappear whenever 'close' is clicked or user clicks off the screen
 * @author: Sam Faulkner
 * @param {boolean} isShown - displays the modal first time it's set to true
 * @param {Glyphicon} glyph - Glyphicon that is displayed in top left corner
 * @param {string} title - displays to the right of the glyph icon at the top of the modal
 * @param {string} message - displays in the modal's body
 * @param {function} closedCallback - if provided it's called whenever the modal is closed
*/
const ErrorModal = React.createClass({
	getInitialState: function() {
	    return {
	    	isShown: true
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
		if (this.props.closeCallback) {
			this.props.closeCallback();
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