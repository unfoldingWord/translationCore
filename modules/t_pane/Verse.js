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

function parseGreek(text) {
	
}

module.exports = Verse;
