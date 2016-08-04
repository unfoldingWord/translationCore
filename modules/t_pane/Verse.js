/**
	* @description: This file builds the verses
	* @author: Ian Hoegen
******************************************************************************/

const api = window.ModuleApi;
const React = api.React;
const lookup = require("./LexiconLookup");
const Popover = require('react-bootstrap/lib/popover');
const OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

class Verse extends React.Component {
	constructor() {
		super();
		this.state = {
			highlighted: false
		}
	}

	setHighlighted(highlighted) {
		this.setState({
			highlighted: highlighted
		});
	}

	render() {
		console.log("rendered");
		return (
			<p>
        <strong className={this.state.highlighted ? 'text-primary' : ''}>
			 		{this.props.verseNumber + " "}
				</strong>
				<span className={this.state.highlighted ? 'text-primary' : ''}>
					{this.props.greek ? displayGreek(this.props.verseText) : this.props.verseText}
				</span>
			</p>
		);
	}
}


function displayGreek(text = []) {
	let i = 0;
	return text.map((word) => {
		var popover = (<Popover id="popover-positioned-scrolling-bottom" title={word.word}>{word.brief}</Popover>);
				return (<OverlayTrigger 
								key={i++} 
								trigger="click" 
								rootClose 
								placement="bottom" 
								overlay={popover}>
								<span
									strong={word.strong}
									speech={word.speech}>
									{word.word + " "}
								</span>
							</OverlayTrigger>
						);
	});
}

module.exports = Verse;
