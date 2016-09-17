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
            selection: "",
            start: 0,
            end: 0
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
            if(check && check.selectionRange){
                this.setState({
                    start: check.selectionRange[0],
                    end: check.selectionRange[1]
                });
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
        var beginsAt = window.getSelection().getRangeAt(0).startOffset;
        var endsAt = window.getSelection().getRangeAt(0).endOffset;
        this.setState({
            selection: text,
            start: beginsAt,
            end: endsAt
        });
        this.props.onWordSelected([text], [text], [beginsAt, endsAt]);
    }

    getWords(){
        return [this.state.selection];
    }

    getHighlightedWords(){
        let verse = this.props.verse
        let range = api.getDataFromCheckStore('LexicalChecker', 'selection');
        let before = verse.substring(0, range[0]);
        let highlighted = verse.substring(range[0], range[1]);
        let after = verse.slice(range[1], verse.length);
        return(
            <div>
                {before}
                <span style={{
                    backgroundColor: 'yellow'
                }}>
                    {highlighted}
                </span>
                {after}
            </div>
        )
    }

    render(){
        return (
            <Well onMouseUp={this.textSelected}>
            {/*This is the only way to use CSS psuedoclasses inline JSX*/}
            <style dangerouslySetInnerHTML={{
                __html: [
                    '.highlighted::selection {',
                    '  background-color: yellow;',
                    '}'
                    ].join('\n')
                }}>
            </style>
            <div className='highlighted'>
                {this.getHighlightedWords()}
            </div>
            </Well>
        )
    }

}

module.exports = TargetVerseDisplay;