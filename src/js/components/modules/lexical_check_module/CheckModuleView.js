//CheckModuleView.js//

/**
 * @description - The main view for the Lexical Check Modules
 * @author Sam Faulkner
 */

//Node Module imports
const React = require('react');

//User imports
const LexicalView = require('./lexical_checker/LexicalChecker.js');
const TranslationWordDisplay = require('./translation_words/TranslationWordsDisplay.js');
const AbstractCheckModule = require('../../AbstractCheckModule.js');
const CheckStore =  require('../../../stores/CheckStore.js');


class LexicalCheckModule extends AbstractCheckModule {
	constructor() {
		super();
	}

	componentWillMount() {
		// super.componentWillMount();
		CheckStore.addChangeListener(this.changeListener);

	}

	componentWillUnmount() {
		CheckStore.removeChangeListener(this.changeListener);
	}

	changeListener() {
		super.refreshCurrentCheck();
		var currentCheck = super.getCurrentCheck();
		this.setState({
			chapter: currentCheck.chapter,
			verse: currentCheck.verse,
			text: currentCheck.text
		});
	}

	render() {
		return (
			<div>
			
			</div>
		);
	}
}

module.exports = LexicalCheckModule;