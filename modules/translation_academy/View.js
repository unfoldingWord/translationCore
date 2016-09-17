
const api = window.ModuleApi;

const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Markdown = require('react-remarkable');

var createTextVersion = require("textversionjs");


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
    //var s = src.replace(/title:|question:/g, "####");
    var array = ["title:", "question:", "manual:", "volume:", "dependencies:", "status:", "tags:", "original_url:"];
    //var t = s.replace(/manual:/g, ">manual:");
    for(var i=0; i< array.length; i++){
      var str = "#### " + array[i];
      var a = array[i];
    var t = src.replace(a, str);
    }
    var res = t.replace(/(<([^>]+)>)/gi, "");
  return res.replace(/(=+)([^=]+)\1/g, function(match, equals, header) {
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
        <Well style={{overflowY: "scroll", minWidth: "100%", minHeight: "367px", maxHeight: "367px"}}>
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
