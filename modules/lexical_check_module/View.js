//View.js//

const api = window.ModuleApi;
const React = api.React;

const TPane = api.getModule('TPane');
const TranslationWordsDisplay = require('./translation_words/TranslationWordsDisplay');

class View extends React.Component {
	constructor() {
		super();
        this.state = {
            currentCheck: null,
            currentTranslationWordFile: null
        }
	}

	componentWillMount() {
        var _this = this;
        //This action will update our data in the store
        api.registerAction('incrementLexicalCheck', this.incrementDataInCheckStore.bind(this));
        //This event listens for an event that will tell us the another check to go to
        api.registerAction('changeLexicalCheck', this.changeCurrentCheckInCheckStore.bind(this));
        
        api.registerEventListener('gotoNext', function(params) {
            api.sendAction({type: 'incrementLexicalCheck', field: 'LexicalCheck'});
        });
        
        api.registerEventListener('gotoCheck', function(params) {
            api.sendAction({type: 'changeLexicalCheck', field: 'LexicalCheck', 
                checkIndex: params.checkIndex, groupIndex: params.groupIndex});
        });
	}

    changeCurrentCheckInCheckStore(lexicalData, action) {
        //error check to make sure we're going to a legal group/check index
        if (action.checkIndex && action.groupIndex) {
            if (action.groupIndex < lexicalData.groups.length) {
                lexicalData.currentGroupIndex = action.groupIndex;
                if (action.checkIndex < lexicalData.groups[lexicalData.currentGroupIndex].length) {
                    lexicalData.checkIndex = action.checkIndex;
                }
            }
        }
        this.updateState();
    }

    incrementDataInCheckStore(lexicalData) {
        if (lexicalData.currentCheckIndex) {
            lexicalData.currentCheckIndex++;

            //check to see if we need to increment our group
            if (lexicalData.currentGroupIndex && //sanity checks 
                lexicalData.groups &&
                lexicalData.currentCheckIndex >= lexicalData.groups[lexicalData.currentGroupIndex].length) {
                lexicalData.currentGroupIndex = Math.min(
                    lexicalData.currentGroupIndex + 1,
                    lexicalData.groups.length);
                if (lexicalData.currentGroupIndex < lexicalData.groups.length) {
                    lexicalData.currentCheckIndex = 0;
                }
            }
        }

        this.updateState();
        
    }

    updateState() {
        this.setState({
            currentCheck: lexicalData.groups[currentGroupIndex][currentCheckIndex],
            currentTranslationWordFile: lexicalData.groups[currentGroupIndex][currentCheckIndex].file
        });
    }



































	render() {
		return (
			<div>
				<TPane />
			</div>
		);
	}
}

module.exports = View;