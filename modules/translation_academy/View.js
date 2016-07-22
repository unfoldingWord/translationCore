
const api = window.ModuleApi;

const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;

const Display = require('./TranslationAcademyDisplay');

/* => <= */ //Ian 'CodeMaster' Hoegen
class View extends React.Component {
	constructor() {
		super();

        this.updateSection = this.updateSection.bind(this);
	}

	componentWillMount() {
		api.registerEventListener('changeTranslationAcademySection',
			this.updateSection);
	}

	componentWillUnmount() {
		api.removeEventListener('changeTranslationAcademySection', 
			this.updateSection);
	}

	updateSection(params) {
		if (params.sectionName) {
			this.refs.Display.getAndDisplaySection(params.sectionName);
		}
	}

	render() {
		return (
			<Well>
			<Display 
				ref="Display"
			/>
			</Well>
		);
	}
}

module.exports = {
    name: "TranslationAcademy",
    view: View
}