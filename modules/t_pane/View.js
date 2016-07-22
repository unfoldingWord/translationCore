//View.js//

const api = window.ModuleApi;

const TPane = require("./TPane");
const React = api.React;


class View extends React.Component {

	render() {
		return (
			<TPane />
		);
	}
}

module.exports = {
  name: "TPane",
  view: View
}