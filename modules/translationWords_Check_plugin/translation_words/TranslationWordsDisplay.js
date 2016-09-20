
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Markdown = require('react-remarkable');

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

    convertToMarkdown(src) {
        return src.replace(/(=+)([^=]+)\1/g, function(match, equals, header) {
            switch(equals.length) {
                case 6:
                    return "##" + header;
                case 5:
                    return "####" + header;
                default:
                    return "#####" + header;
            }
        });
    }

    render() {
        var source = this.props.file;
        if (source) {
            return (
                <div style={{overflowY: "scroll", minWidth: "100%", padding: '9px', minHeight: "438px", maxHeight: "438px"}}>
                    <div>
                        <Markdown source={this.convertToMarkdown(source)} />
                    </div>
                </div>
            );
        }
        else {
            console.error('Source for TranslationWordsDisplay is undefined');
            return (<div></div>);
        }
    }
}

module.exports = TranslationWordsDisplay;
