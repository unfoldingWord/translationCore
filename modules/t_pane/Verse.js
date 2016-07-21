/**
 * @description: This file builds the verses
 * @author: Ian Hoegen
 ******************************************************************************/
// const React = require('react');

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
        {this.props.verseText}
			</p>
		);
	}
}

module.exports = Verse;
