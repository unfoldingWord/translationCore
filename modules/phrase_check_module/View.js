const api = window.ModuleApi;
const TPane = api.getModule('TPane');
const TADisplay = api.getModule('TADisplay');

const RB = api.ReactBootstrap;
const {Grid, Row, Col} = RB;
const React = api.React;
const ScriptureDisplay = require('./subcomponents/ScriptureDisplay');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');

class PhraseChecker extends React.Component{
  constructor(){
    super();

    this.splitCheck = this.splitCheck.bind(this);
    this.newCheck = this.newCheck.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('phraseDataLoaded', this.newCheck);
  }

  newCheck(){
    var phraseCheck = api.getDataFromCheckStore('PhraseCheck');
    var targetLanguage = api.getDataFromCommon('targetLanguage');
    var newCheck = this.splitCheck(phraseCheck, targetLanguage);
    console.log(newCheck);
    this.setState(newCheck);
  }

  splitCheck(phraseCheck, targetLanguage){
    /**
     * PhrasesObj structure:
     {
      [
        {
          group: "figs..."
          checks: [
            {
              ...
            }
            ...
          ]
        }...
      ]
     }
    */
    if (phraseCheck && targetLanguage) {
      var returnObj = {};

      /**
      * Pulls current check out of the larger phraseCheck object, we find it
      * using the indices of our group and check from the phraseCheck object
      **/
      returnObj.currentCheck = phraseCheck["Phrase Checks"] //Top level object
                                   [phraseCheck['currentGroupIndex']] //Group index
                                   ["checks"] //Checks at that gropu index
                                   [phraseCheck['currentCheckIndex']]; //Check index

      /**
      * Pulls the target language verse out of our target language object using
      * the chapter and verse values from the current check object that we
      * extracted data from above
      **/
      returnObj.currentVerse = targetLanguage //Target Language
                                  ["0" + returnObj.currentCheck.chapter.toString()] //Current chapter
                                  [returnObj.currentCheck.verse.toString()]; //Current verse

      return returnObj
    }else{
      console.log("Check store is empty");
    }
  }

  render() {
    if(!this.state){
      return <div></div>;
    }
      return (
        <div>
        <TPane />
        <Grid>
            <Row className="show-grid">
              <Col md={12}>
                <ScriptureDisplay
                  scripture={this.state.currentVerse}
                  currentVerse={this.state.currentCheck.book
                                + " " + this.state.currentCheck.chapter
                                + ":" + this.state.currentCheck.verse}
                />
              </Col>
            </Row>
            <Row className="show-grid">
              <Col md={6} className="confirm-area">
                <ConfirmDisplay
                  phraseInfo={this.state.currentCheck.phraseInfo}
                  phrase={this.state.currentCheck.phrase}
                />
              </Col>
              <Col md={6}>
                <FlagDisplay
                />
              </Col>
            </Row>
        </Grid>
        </div>
      );
  }
}

module.exports = PhraseChecker;
