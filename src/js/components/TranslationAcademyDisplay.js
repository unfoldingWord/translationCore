const React = require('react');
const Markdown = require('react-remarkable');

const Well = require('react-bootstrap/lib/Well.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const Button = require('react-bootstrap/lib/Button.js');

const TranslationAcademyScraper = require('./TranslationAcademyScraper.js');
const EventEmitter = require('events').EventEmitter;

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
/**
* This callback will fire once the data has been retrieved from the internet
* 'data' contains the list of words
*/
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
/**
* Sets the attribute 'currentMarkdown' from the file returned from
* the htmlscraper
*/
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

module.exports = TranslationAcademyDisplay;
