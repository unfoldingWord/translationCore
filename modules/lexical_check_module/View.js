//View.js//

const api = window.ModuleApi;
const React = api.React;

class View extends React.Component {
	constructor() {
		super();
	}

	componentWillMount() {
		this.TPane = api.getModule('TPane');
	}

	render() {
		return (
			<div>
				<this.TPane />
			</div>
		);
	}
}

module.exports = View;