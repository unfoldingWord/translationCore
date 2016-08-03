/**
 * @description: This file builds the verses
 * @author: Ian Hoegen
 ******************************************************************************/

const api = window.ModuleApi;
const React = api.React;

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

var greekRegex = /([^\w\s,.\-?!\(\)]+)\s+(G\d{2,6})\s+(?:G\d{2,6})*\s*([A-Z0-9\-]+)/g;

function parseGreek(text = "") {
	let result;
	let words = [];
	let i = 0;
	while (result = greekRegex.exec(text)) {
		try {
			var [,word,strong,speech] = result;
		}
		catch(e) {
			console.log("parse error");
		}
		words.push(<span key={i++} strong={strong} speech={speech} onClick={() => {console.log(word)}}>{word}</span>);
	}
	return words;
}

module.exports = Verse;
