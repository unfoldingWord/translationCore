


const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;
const Glyphicon = ReactBootstrap.Glyphicon;
const Button = ReactBootstrap.Button;

const Markdown = require('./react-remarkable');
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

/*
const TranslationAcademyDisplay = React.createClass({
// this makes fields start off empty so they can be filled eventually
  sectionList: null,

  currentMarkdown: null,

  tAHtmlScraper: null,
// gets the initial states of the fields so that when they are toggled they can be displayed
  getInitialState: function() {
    this.getAndDisplaySection();
    return {
      toggleDisplay: false,
      currentSection: null,
      markdownToggle: false,
      value: ''
    };
  },

  componentWillMount: function() {
    this.getAndDisplaySection();
  },

  getAndDisplaySection: function() {
    var _this = this;
// create new instance of the scraper

    function setList(data) {
// set our list to the data that was retrieved, when done it calls display section
      _this.sectionList = data;
// everytime the state changes React re-renders the component so the display changes
      _this.setState({

        toggleDisplay: !_this.state.toggleDisplay
      });
// passing display section as a prop
      _this.displaySection(_this.props.sectionName);
    }
// creates a new instance because its a class and classes need objects
    this.tAHtmlScraper = new TranslationAcademyScraper();
// Get the list of sections in tA , undefined because i want the default url, when done it calls funtion set list
    this.tAHtmlScraper.getTranslationAcademySectionList(undefined, setList);
  },

  updateText: function(e) {
    this.setState({value: this.state.value});
  },

  render: function() {
    var _this = this;
    return (
      <Well>
        <div style={{overflowY: "scroll"}}>
          <h1> Translation Academy</h1>
          {_this.currentMarkdown}
        </div>
      </Well>
    );
  },

  displaySection: function(sectionName) {
    this.setState({
      currentSection: sectionName
    });
    var rawMarkdown = null;
    var _this = this;
    this.tAHtmlScraper.getSection(sectionName + '.md',
      function(file) { // assign callback
        rawMarkdown = file;
        var markDownToDisplay = rawMarkdown.split("---")[2];
        _this.setCurrentMarkdown(
          <Markdown source={markDownToDisplay}/>
        );
      }
    );
  },

  setCurrentMarkdown: function(markdownComponent) {
    this.currentMarkdown = markdownComponent;
    this.setState({
      markdownToggle: !this.state.markdownToggle
    });
    this.forceUpdate();
  }
});
*/
module.exports = TranslationAcademyDisplay;
