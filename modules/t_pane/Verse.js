/**
 * @description: This file builds the verses
 * @author: Ian Hoegen
 ******************************************************************************/
// const React = require('react');

const api = window.ModuleApi;
const React = api.React;

// const Scroll = require('./react-scroll');
// const ScrollElement = Scroll.Element;

class Verse extends React.Component {
	constructor() {
		super();
	}

	render() {
		return (
			// <ScrollElement 
			// 	name={this.props.chapterNumber.toString() + ":" + this.props.verseNumber.toString()}
			// 	className={"element"}
			// >
				<p>
			        <strong>{this.props.verseNumber} </strong>
			        {this.props.verseText}
			    </p>
			// </ScrollElement>
		);
	}
}

module.exports = Verse;
