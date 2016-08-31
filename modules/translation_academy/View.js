
const api = window.ModuleApi;

const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Markdown = require('react-remarkable');
const Well = ReactBootstrap.Well;

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
        <Well style={{overflowY: "scroll", minWidth: "100%", minHeight: "317px", maxHeight: "317px"}}>
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

module.exports = {
    name: "TranslationAcademy",
    view: View
}
