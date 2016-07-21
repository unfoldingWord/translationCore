const api = window.ModuleApi;
const TPane = api.getModule('TPane');
const TADisplay = api.getModule('TADisplay');

const RB = api.ReactBootstrap;
const {Grid, Row, Col} = RB;
const React = api.React;
const ScriptureDisplay = require('./subcomponents/ScriptureDisplay');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');

const NAMESPACE = 'PhraseCheck';

class PhraseChecker extends React.Component{
  constructor(){
    super();

    this.state = {
      currentCheck: null
    }
  }

  componentWillMount(){
    var _this = this;
    //This action will update our indexes in the store
    api.registerAction('changePhraseCheck', this.changeCurrentCheckInCheckStore.bind(this));

    //This action will update the status of the check that is the current check in the CheckStore
    api.registerAction('updateCheckStatus', this.updateCheckStatus.bind(this));

    /*
     * This event will call an action that increment the checkIndex by one,
     * and might increment the group index if needed. Because no parameters are given
     * from the event, we have to get the current indexes from the store and increment it
     * manually before sending the action to update the store
     */
    api.registerEventListener('goToNext', function(params) {
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        api.sendAction({
          type: 'changePhraseCheck',
          field: NAMESPACE,
          checkIndex: currentCheckIndex + 1,
          groupIndex: currentGroupIndex
        });
    });

    /*
     * This event listens for an event that will tell us another check to go to,
     * and sends the appropriate action. This and the above listener need to be two
     * seperate listeners because the 'gotoNext' event won't have parameters attached to it
     */
    api.registerEventListener('goToCheck', function(params) {
        api.sendAction({
          type: 'changePhraseCheck',
          field: NAMESPACE,
          checkIndex: params.checkIndex,
          groupIndex: params.groupIndex
        });
    });

    api.registerEventListener('phraseDataLoaded', function(params) {
      _this.updateState();
    });
  }

  /**
   * @description - action callback to update the status of the check that is the current check
   * in the check store
   * @param {object} lexicalData - the object that is referenced under the given namespace in the
   * CheckStore
   * @param {object} action - this is the exact action that was passed to api.sendAction
   */
  updateCheckStatus(lexicalData, action) {
    var currentCheck = lexicalData.groups[lexicalData.currentGroupIndex]['checks'][lexicalData.currentCheckIndex];
    if (currentCheck.status) {
      currentCheck.status = action.checkStatus;
    }
  }

  /**
   * @description - This is an action callback. This is used to change our current check index
   * and group index within the store
   * @param {object} lexicalData - This is the object found under the namespace that is
   * currently in the CheckStore's data
   * @param {object} action - This the exact action that is passed to api.sendAction, so that
   * we can have access to extra fields we might have put on it
   */

  changeCurrentCheckInCheckStore(phraseData, action) {
      //error check to make sure we're goingd to a legal group/check index
      if (action.checkIndex !== undefined && action.groupIndex !== undefined) {
        if (action.groupIndex < phraseData.groups.length) {
          phraseData.currentGroupIndex = action.groupIndex;
          if (action.checkIndex < phraseData.groups[phraseData.currentGroupIndex].checks.length) {
            phraseData.currentCheckIndex = action.checkIndex;
          }
          /* In the case that we're incrementing the check and now we're out of bounds
           * of the group, we increment the group.
           */
          else if (action.checkIndex == phraseData.groups[phraseData.currentGroupIndex].checks.length &&
            phraseData.currentGroupIndex < phraseData.groups.length - 1) {
            phraseData.currentGroupIndex++;
            phraseData.currentCheckIndex = 0;
          }
        }
      }
      this.updateState();
  }

  /**
   * @description - This method grabs the information that is currently in the
   * store and uses it to update our state which in turn updates our view. This method is
   * typically called after actions are sent so that our view updates to the latest
   * data found in the store
   */
  updateState() {
    var newGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var newCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var newCheck = api.getDataFromCheckStore(NAMESPACE, 'groups')[newGroupIndex]['checks'][newCheckIndex];
    this.setState({
        currentCheck: newCheck,
    });
    api.emitEvent('goToVerse', {chapterNumber: currentCheck.chapter, verseNumber: currentCheck.verse});
  }

  /**
  * Pulls the target language verse out of our target language object using
  * the chapter and verse values from the current check object that we
  * extracted data from above
  **/
  getTLVerse(targetLanguage){
      return targetLanguage[this.state.currentCheck.chapter][this.state.currentCheck.verse]
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
    if(!this.state.currentCheck){
      return <div></div>;
    }
      return (
        <div>
          <TPane />
          <Grid>
              <Row className="show-grid">
                <Col md={6}>
                  <TADisplay />
                </Col>
                <Col md={6}>
                  <Row className="show-grid">
                    <ScriptureDisplay
                      scripture={this.getVerse('targetLanguage')}
                      currentVerse={this.state.currentCheck.book
                                    + " " + this.state.currentCheck.chapter
                                    + ":" + this.state.currentCheck.verse}
                    />
                  </Row>
                <Row className="show-grid">
                  <Col md={6} className="confirm-area">
                    <ConfirmDisplay
                      phraseInfo={this.state.currentCheck.phraseInfo}
                      phrase={this.state.currentCheck.phrase}
                    />
                  </Col>
                  <Col md={6}>
                    <FlagDisplay/>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Grid>
        </div>
      );
  }
}

module.exports = PhraseChecker;
