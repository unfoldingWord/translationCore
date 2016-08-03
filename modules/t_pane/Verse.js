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
        <strong className={this.state.highlighted ? 'text-primary' : ''}>{this.props.verseNumber} </strong>
				<span className={this.state.highlighted ? 'text-primary' : ''}>{this.props.verseText}</span>
			</p>
		);
	}
}

module.exports = Verse;
