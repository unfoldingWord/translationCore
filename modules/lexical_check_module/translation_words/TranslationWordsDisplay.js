
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
                <Well style={{overflowY: "scroll", minWidth: "100%", minHeight: "438px", maxHeight: "438px"}}>
                    <div>
                        <Markdown source={this.convertToMarkdown(source)} />
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
