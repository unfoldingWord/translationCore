/**
 * A more organic implementation of the Target Verse Display
 * Author: Luke Wilson
 */

const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;

class TargetVerseDisplay extends React.Component{
    constructor(){
        super();
        this.state = {
            selection: ""
        }

        this.getSelectedWords = this.getSelectedWords.bind(this);
        this.textSelected = this.textSelected.bind(this);
        this.getWords = this.getWords.bind(this);
    }
    componentWillMount(){
        this.getSelectedWords();
    }

    getSelectedWords(){
        var checkIndex = api.getDataFromCheckStore('LexicalChecker', 'currentCheckIndex');
        var groupIndex = api.getDataFromCheckStore('LexicalChecker', 'currentGroupIndex');
        if(checkIndex != null && groupIndex != null){
            var check = api.getDataFromCheckStore('LexicalChecker', 'groups')[groupIndex].checks[checkIndex];
            if(check && check.selectedWordsRaw){
                this.selection = currentCheck.selectedWordsRaw;
            }
        }
    }

    textSelected(){
        var text = "";
        if(window.getSelection) {
            text = window.getSelection().toString();
        } else if(document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        //This returns selection twice because one is the "raw" selection and the other is supposed
        //to be word objects but it works as a raw object as well. This needs to be refactored in text
        //he view another time.
        this.setState({selection: text});
        this.props.onWordSelected([text], [text]);
    }

    getWords(){
        return [this.state.selection];
    }

    render(){
        return (
            <Well onMouseUp={this.textSelected}>
            <style dangerouslySetInnerHTML={{
                __html: [
                    '.highlighted::selection {',
                    '  background-color: yellow;',
                    '}'
                    ].join('\n')
                }}>
            </style>
            <div className='highlighted'>
                {this.props.verse}
            </div>
            </Well>
        )
    }

}

module.exports = TargetVerseDisplay;