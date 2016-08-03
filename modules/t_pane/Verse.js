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
		return (
			<p>
			<strong className={this.state.highlighted ? 'text-primary' : ''}>
			{this.props.verseNumber + " "}
			</strong>
			<span className={this.state.highlighted ? 'text-primary' : ''}>
			{this.props.greek ? parseGreek(this.props.verseText) : this.props.verseText}
			</span>
			</p>
		);
	}
}

var greekRegex = /([^\w\s,.\-?!\(\)]+)\s+G(\d{2,6})\s+(?:G\d{2,6})*\s*([A-Z0-9\-]+)/g;

function parseGreek(text = "") {
	let result;
	let words = [];
	let i = 0;
	while (result = greekRegex.exec(text)) {
		try {
			let [,word,strong,speech] = result;
			var popover = (<Popover id="popover-trigger-click-root-close" title={word}>
			{lookup(strong, true)}
			</Popover>);
			words.push(
				<OverlayTrigger key={i++} trigger="click" rootClose placement="bottom" overlay={popover}>
				<span
				strong={strong}
				speech={speech}>
				{word + " "}
				</span>
				</OverlayTrigger>
			);
		}
		catch(e) {
			console.error(e);
			console.log("parse error");
		}
	}
	return words;
}

module.exports = Verse;
