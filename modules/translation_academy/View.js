
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
    //manny: parsing the data we get from tA to display this info more cleanly
    var array = ["title:", "question:", "manual:", "volume:", "slug:", "dependencies:", "status:", "tags:", "recommended:", "original_url:"];
    for(var i=0; i < array.length; i++){
      var arr = array[i];
      var SRC = src.replace(arr, function(){return "###### " + array[i];});
      src = SRC;
    }
    var res = SRC.replace(/(<([^>]+)>)/gi, "");
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
        <div style={{overflowY: "scroll", padding: '9px', minWidth: "100%", minHeight: "367px", maxHeight: "367px"}}>
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

module.exports = {
    name: "TranslationAcademy",
    view: View
}
