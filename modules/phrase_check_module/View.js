const api = window.ModuleApi;
var TPane = null;
var TADisplay = null;

const RB = api.ReactBootstrap;
const {Row, Col} = RB;
const React = api.React;
const ScriptureDisplay = require('./subcomponents/ScriptureDisplay');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');

const NAMESPACE = 'PhraseChecker';

class PhraseChecker extends React.Component{
  constructor(){
    super();
    this.state = {
      currentCheck: null
    }

    TADisplay = api.getModule('TranslationAcademy');
    TPane = api.getModule('TPane');

    this.updateState = this.updateState.bind(this);
    this.goToNext = this.goToNext.bind(this);
    this.goToCheck = this.goToCheck.bind(this);
  }

  componentWillMount(){
    this.updateState();
    var _this = this;
    
    api.registerEventListener('goToNext', this.goToNext);
    api.registerEventListener('goToCheck', this.goToCheck);
    api.registerEventListener('phraseDataLoaded', this.updateState);

    // api.registerEventListener('changeCheckType', this.updateState.bind(this));
  }

  componentWillUnmount(){
    api.removeEventListener('phraseDataLoaded', this.updateState);
    api.removeEventListener('goToCheck', this.goToCheck);
    api.removeEventListener('goToNext', this.goToNext);
  }

  goToCheck(params){
    this.changeCurrentCheckInCheckStore(params.groupIndex, params.checkIndex);
  }

  goToNext(params) {
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex + 1);
  }

  changeCurrentCheckInCheckStore(newGroupIndex, newCheckIndex) {
      var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
      var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
      var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
      //error check to make sure we're going to a legal group/check index
      if (newGroupIndex !== undefined && newCheckIndex !== undefined) {
        if (newGroupIndex < groups.length) {
          api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
          if (newCheckIndex < groups[currentGroupIndex].checks.length) {
            api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
          }
          /* In the case that we're incrementing the check and now we're out of bounds
           * of the group, we increment the group.
           */
          else if (newCheckIndex == groups[currentGroupIndex].checks.length &&
            currentGroupIndex < groups.length - 1) {
            api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', currentGroupIndex + 1);
            api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', 0);
          }
        }
      }
      this.updateState();
  }

  updateState() {
    var newGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var newCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var newCheck = api.getDataFromCheckStore(NAMESPACE, 'groups')[newGroupIndex]['checks'][newCheckIndex];
    this.setState({
        currentCheck: newCheck,
    });
    api.emitEvent('goToVerse', {chapterNumber: newCheck.chapter, verseNumber: newCheck.verse});
  }

  getVerse(language){
    var currentVerseNumber = this.state.currentCheck.verse;
    var currentChapterNumber = this.state.currentCheck.chapter;
    var desiredLanguage = api.getDataFromCommon(language);
    if (desiredLanguage){
      return desiredLanguage[currentChapterNumber][currentVerseNumber];
    } else {
      console.error("Unable to find Language: " + language);
    }
  }

  render() {
    var targetVerse = this.getVerse('targetLanguage');
    if(!this.state.currentCheck){
      return <div></div>;
    }
      return (
        <div>
        <TPane />
        <Row className="show-grid">
          <Col md={12}>
            <ScriptureDisplay
              scripture={targetVerse}
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
        <br />
        <TADisplay />
        </div>
      );
  }
}

module.exports = {
  name: NAMESPACE,
  view: PhraseChecker
}
