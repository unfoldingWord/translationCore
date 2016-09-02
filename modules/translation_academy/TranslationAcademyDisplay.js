


const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;
const Glyphicon = ReactBootstrap.Glyphicon;
const Button = ReactBootstrap.Button;

const Markdown = require('react-remarkable');
const TranslationAcademyScraper = require('./TranslationAcademyScraper');

class TranslationAcademyDisplay extends React.Component {
  constructor() {
    super();
    this.state = ({
      currentSection: null
    });
  }

  getAndDisplaySection(sectionName) {
    var _this = this;
    TranslationAcademyScraper.getSection(sectionName, function(data) {

        var markdown = <Markdown source={data} />;
        _this.setState({
          currentSection: markdown
        });
    });
  }

  render() {
    var section = this.state.currentSection;
    return (
      <div>
      {section}
      </div>
    );
  }
}
module.exports = TranslationAcademyDisplay;
