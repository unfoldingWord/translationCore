/**
 * @description: This file builds the verses
 * @author: Ian Hoegen
 ******************************************************************************/

const api = window.ModuleApi;
const React = api.React;
const lookup = require("./LexiconLookup");

class Verse extends React.Component {
	constructor() {
		super();
	}

	render() {
		return (
			<p>
        <strong>{this.props.verseNumber} </strong>
        {this.props.greek ? parseGreek(this.props.verseText) : this.props.verseText}
			</p>
		);
	}
}

var greekRegex = /([^\w\s,.\-?!\(\)]+)\s+G(\d{2,6})\s+(?:G\d{2,6})*\s*([A-Z0-9\-]+)/g;

function parseGreek(text = "") {
	let result;
	let words = [];
	let i = 0;
	debugger;
	while (result = greekRegex.exec(text)) {
		try {
			let [,word,strong,speech] = result;
			words.push(<span key={i++} strong={strong} speech={speech} onClick={() => api.Toast.success(word, lookup(strong).brief, 3)}>{word + " "}</span>);
		}
		catch(e) {
			console.log("parse error");
		}
	}
	return words;
}

module.exports = Verse;
