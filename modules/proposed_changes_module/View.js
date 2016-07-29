//View.js//

const React = window.ModuleApi.React;
const ProposedChanges = require("./ProposedChanges");


class View extends React.Component {
    constructor() {
        super();
    }

	render() {
		return (
			<ProposedChanges selectedWord={this.props.selectedWord}/>
		);
	}
}

module.exports = {
    name: "ProposedChanges",
    view: View
}
