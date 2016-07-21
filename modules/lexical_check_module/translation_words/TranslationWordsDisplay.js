
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Markdown = require('react-remarkable');

const Well = ReactBootstrap.Well;

// const fileRegex = new RegExp("=*\\s*([^=]+)\\W*(?:Definition|Facts):\\W*([^=]*)", 'g');

class TranslationWordsDisplay extends React.Component {
    constructor() {
        super();
        this.state = {
            file: null
        };
    }

    changeFile(file) {
        this.setState({
            'file': file
        });
    }

    // getRelevantDataFromFile(file) {
    //     var matches = fileRegex.match(file);
    //     return matches;
    // }

    render() {
        var source = this.props.file;
        if (source) {
            return (
                <Well>
                    <div style={{overflowY: "scroll", minWidth: "100%", minHeight: "300px", maxHeight: "300px"}}>
                        <Markdown source={source.split('==').join('#')} />
                    </div>
                </Well>
            );
        }
        else {
            console.error('Source for TranslationWordsDisplay is undefined');
            return (<div></div>);
        }
    }
}

module.exports = TranslationWordsDisplay;