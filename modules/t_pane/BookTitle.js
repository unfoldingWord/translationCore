/**
 * @description: This file builds the BookTitle
 * @author: Ian Hoegen
 ******************************************************************************/
// const React = require('react');
const api = window.ModuleApi;

const React = api.React;

class BookTitle extends React.Component {
	constructor() {
		super();
	}
	render() {
		return (
			<h4>{this.props.title}</h4>
		);
	}
}

module.exports = BookTitle;
