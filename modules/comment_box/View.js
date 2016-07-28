//View.js//

const React = window.ModuleApi.React;
const CommentBox = require("./CommentBox");


class View extends React.Component {
    constructor() {
        super();
    }

	render() {
		return (
			<CommentBox />
		);
	}
}

module.exports = {
    name: "CommentBox",
    view: View
}
