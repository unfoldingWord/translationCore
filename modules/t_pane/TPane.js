/**
 * @author Ian Hoegen
 * @description This component displays the Original Language, Gateway Language,
 *              and the Target Language. It takes it's input from uploads.
 ******************************************************************************/


const api = window.ModuleApi;
const React = api.React;

const Row = api.ReactBootstrap.Row;
const Well = api.ReactBootstrap.Well;
const Pane = require('./Pane');



//string constants
const TARGET_LANGUAGE_ERROR = "Unable to load target language from CheckStore",
    ORIGINAL_LANGUAGE_ERROR = "Unable to load original language from CheckStore",
    GATEWAY_LANGUAGE_ERROR = "Unable to load gateway language from CheckStore";

class TPane extends React.Component {
  constructor() {
      super();
      var originalLanguage = api.getDataFromCheckStore("TPane", 'parsedGreek');
      if (!originalLanguage) {
		parseGreek();
        originalLanguage = api.getDataFromCheckStore("TPane", 'parsedGreek');
      }
      var targetLanguage = api.getDataFromCommon('targetLanguage');
      var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
      this.state = {
          "originalLanguage": !originalLanguage ? "" : originalLanguage,
          "targetLanguage": !targetLanguage ? "" : targetLanguage,
          "gatewayLanguage": !gatewayLanguage ? "" : gatewayLanguage,
      }

      this.updateOriginalLanguage = this.updateOriginalLanguage.bind(this);
      this.updateGatewayLanguage = this.updateGatewayLanguage.bind(this);
      this.updateTargetLanguage = this.updateTargetLanguage.bind(this);
  }

  componentWillMount() {
      api.registerEventListener("updateOriginalLanguage", this.updateOriginalLanguage);
      api.registerEventListener("updateTargetLanguage", this.updateTargetLanguage);
      api.registerEventListener("updateGatewayLanguage", this.updateGatewayLanguage)
  }

  componentWillUnmount() {
    api.removeEventListener("updateOriginalLanguage", this.updateOriginalLanguage);
    api.removeEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.removeEventListener("updateGatewayLanguage", this.updateGatewayLanguage);
  }

  updateTargetLanguage() {
    var targetLanguage = api.getDataFromCommon("targetLanguage");
    if (targetLanguage) {
        this.setState({
            targetLanguage: targetLanguage
        });
    }
    else {
        console.error(TARGET_LANGUAGE_ERROR);
    }
  }

  updateOriginalLanguage() {
    var originalLanguage = api.getDataFromCommon("originalLanguage");
    if (originalLanguage) {
        this.setState({
            originalLanguage: originalLanguage
        });
    }
    else {
        console.error(ORIGINAL_LANGUAGE_ERROR);
    }
  }

  updateGatewayLanguage() {
    var gatewayLanguage = api.getDataFromCommon("gatewayLanguage");
    if (gatewayLanguage) {
        this.setState({
            gatewayLanguage: gatewayLanguage
        });
    }
    else {
        console.error(GATEWAY_LANGUAGE_ERROR);
    }
  }

  render() {
    return (
      <Well style={{margin: '5px 0 5px 0'}}>
      <h3 style={{width: '100%', marginTop: '-8px'}}>Scriptural Context</h3>
        <Row>
          <Pane greek={true} content={this.state.originalLanguage} />
          <Pane content={this.state.gatewayLanguage}/>
          <Pane last={true} content={this.state.targetLanguage}/>
        </Row>
      </Well>
    );
  }
}

 module.exports = TPane;

/**
 * @author Evan Wiederspan
 * @description parses the incoming greek and modifies it to be ready 
 */
function parseGreek() {
	// looking at it now, this method with the regex may be way less efficient
	// than just splitting the verse by spaces and going word by word
	// this might want to be reworked later for efficiency
	var greekRegex = /([^\w\s,.\-?!\(\)]+)\s+G(\d{1,6})\s+(?:G\d{1,6})*\s*([A-Z0-9\-]+)/g;
	var lex = require("./Lexicon.json");
	let origText = api.getDataFromCommon("originalLanguage");
	let parsedText = {};
	for (let ch in origText) {
		if (!parseInt(ch)) { // skip the title
			continue;
		}
		parsedText[ch] = {};
		let chap = origText[ch];
		for (let v in chap) {
			let origVerse = origText[ch][v];
			let verse = parsedText[ch][v] = [];
			let result = [];
			while(result = greekRegex.exec(origVerse)) {
				try {
					let [,word,strong,speech] = result;
					let {brief, long} = lex[strong];
					verse.push({word, strong, speech, brief, long});
				}
				catch(e) {
					console.log("parse error");
				}
			}
		}
	}
	api.putDataInCheckStore("TPane", "parsedGreek", parsedText);
}
