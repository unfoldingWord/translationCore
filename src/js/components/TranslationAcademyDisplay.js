const React = require('react');
const Markdown = require('react-remarkable');

const Well = require('react-bootstrap/lib/Well.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const Button = require('react-bootstrap/lib/Button.js');

const TranslationAcademyScraper = require('./TranslationAcademyScraper.js');

const TranslationAcademyDisplay = React.createClass({
  sectionList: null,

  currentMarkdown: null,

  tAHtmlScraper: null,

  getInitialState: function() {
    return {
      toggleDisplay: false,
      currentSection: null,
      markdownToggle: false,
      value: ''
    };
  },

  componentWillMount: function() {
    var _this = this;
    //create new instance of the scraper
    /**
     * This callback will fire once the data has been retrieved from the internet
     * 'data' contains the list of words
     */
      function setList(data){
        //set our list to the data that was retrieved
        _this.sectionList = data;
        //toggle our display so that React re-renders the component
        _this.setState({
          toggleDisplay: !_this.state.toggleDisplay
        });
        _this.displaySection("choose_team");
      }
      console.log('Display');
      console.log(setList);
	  this.tAHtmlScraper = new TranslationAcademyScraper();
    //Get the list of sections in tA
    this.tAHtmlScraper.getTranslationAcademySectionList(undefined, setList);
  },

  updateText: function(e) {
      console.log('Value: ' + e.target.value);
      this.setState({value: this.state.value});
    },

  render: function() {
    var _this = this;
    return (
      <Well>
				<div
					style={{

						overflowY: "scroll"
					}}
				>
					{this.currentMarkdown}
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
			function(file) { //assign callback
				rawMarkdown = file;
				_this.setCurrentMarkdown(
					<Markdown
						source={rawMarkdown}
					/>
				);
			}
		);
	},

  setCurrentMarkdown: function(markdownComponent){
    this.currentMarkdown = markdownComponent;
    this.setState({
      markdownToggle: !this.state.markdownToggle
    });
  }
});

module.exports = TranslationAcademyDisplay;
