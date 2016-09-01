//View.js//

//Api Consts
const api = window.ModuleApi;
const React = api.React;

//Modules not defined within phrase_check_module
var TPane = null;
var ProposedChanges = null;
var CommentBox = null;
var TranslationAcademy = null;

//Bootstrap consts
const RB = api.ReactBootstrap;
const {Row, Col} = RB;

//Modules that are defined within phrase_check_module
const TargetVerseDisplay = require('./subcomponents/TargetVerseDisplay');
const GatewayVerseDisplay = require('./subcomponents/GatewayVerseDisplay.js');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');
const EventListeners = require('./ViewEventListeners.js');
//String constants
const NAMESPACE = "PhraseChecker",
      UNABLE_TO_FIND_LANGUAGE = "Unable to find language from the store";

/**
 * @description - This class defines the entire view for the Phrase Check Module
 */
class View extends React.Component{
  constructor(){
    super();
    this.state = {
      currentCheck: null,
    }
    TPane = api.getModule('TPane');
    ProposedChanges = api.getModule('ProposedChanges');
    CommentBox = api.getModule('CommentBox');
    TranslationAcademy = api.getModule('TranslationAcademy');

    this.updateState = this.updateState.bind(this);
    this.goToNextListener = EventListeners.goToNext.bind(this);
    this.goToPreviousListener = EventListeners.goToPrevious.bind(this);
    this.goToCheckListener = EventListeners.goToCheck.bind(this);
    this.changeCurrentCheckInCheckStore = this.changeCurrentCheckInCheckStore.bind(this);
    this.changeCheckTypeListener = EventListeners.changeCheckType.bind(this);
  }

  componentWillMount(){
    this.updateState();
    api.registerEventListener('goToNext', this.goToNextListener);
    api.registerEventListener('goToPrevious', this.goToPreviousListener);
    api.registerEventListener('goToCheck', this.goToCheckListener);
    api.registerEventListener('changeCheckType', this.changeCheckTypeListener);
    api.registerEventListener('phraseDataLoaded', this.updateState);
  }

  componentDidMount() {
    //this should already be set in the state from componentWillMount
    var currentCheck = this.state.currentCheck;
    if (currentCheck) {
      //Let T Pane know to scroll to are current verse
      api.emitEvent('goToVerse', {chapterNumber: currentCheck.chapter, verseNumber: currentCheck.verse});
      //Tell ProposedChanges what it should be displaying if we already have a proposed change there
      if (this.refs.ProposedChanges) {
        this.refs.ProposedChanges.update(this.refs.TargetVerseDisplay.getWords());
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.refs.ProposedChanges) {
      this.refs.ProposedChanges.update(this.refs.TargetVerseDisplay.getWords());
    }
  }

  componentWillUnmount(){
    api.removeEventListener('goToNext', this.goToNextListener);
    api.removeEventListener('goToPrevious', this.goToPreviousListener);
    api.removeEventListener('goToCheck', this.goToCheckListener);
    api.removeEventListener('phraseDataLoaded', this.updateState);
    api.registerEventListener('changeCheckType', this.changeCheckTypeListener);
  }

  getCurrentCheck() {
    var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentCheck = groups[currentGroupIndex]['checks'][currentCheckIndex];
    return currentCheck;
  }

  updateUserAndTimestamp() {
    let currentCheck = this.getCurrentCheck();
    let currentUser = api.getLoggedInUser();
    let timestamp = new Date();
    currentCheck.user = currentUser;
    currentCheck.timestamp = timestamp;
  }

    /**
     * @description - updates the status of the check that is the current check in the check store
     * @param {object} newCheckStatus - the new status chosen by the user
     */
    updateCheckStatus(newCheckStatus, selectedWords) {
      var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
      var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
      var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
      var currentCheck = groups[currentGroupIndex]['checks'][currentCheckIndex];
      if (currentCheck.checkStatus) {
        currentCheck.checkStatus = newCheckStatus;
        api.emitEvent('changedCheckStatus', {
          groupIndex: currentGroupIndex,
          checkIndex: currentCheckIndex,
          checkStatus: newCheckStatus
        });
        this.updateUserAndTimestamp();
      }
      this.updateState();
    }

  updateSelectedWords(selectedWords, selectedWordsRaw) {
    if (this.refs.ProposedChanges) {
      this.refs.ProposedChanges.update(selectedWords);
    }
    var currentCheck = this.getCurrentCheck();
    currentCheck.selectedWords = selectedWords;
    //This is needed to make the display persistent, but won't be needed in reports
    currentCheck.selectedWordsRaw = selectedWordsRaw;
    this.updateUserAndTimestamp();
  }


    /**
     * @description - This is used to change our current check index and group index within the store
     * @param {object} newGroupIndex - the group index of the check selected in the navigation menu
     * @param {object} newCheckIndex - the group index of the check selected in the navigation menu
     */
  changeCurrentCheckInCheckStore(newGroupIndex, newCheckIndex) {
    //Get the proposed changes and add it to the check
    var proposedChanges = this.refs.ProposedChanges.getProposedChanges();
    let comment = this.refs.CommentBox.getComment();
    var currentCheck = this.getCurrentCheck();

    var loggedInUser = api.getLoggedInUser();
    var userName = loggedInUser ? loggedInUser.userName : 'GUEST_USER';

    if (currentCheck) {
      if (proposedChanges && proposedChanges != "") {
        currentCheck.proposedChanges = proposedChanges;
        this.refs.ProposedChanges.setNewWord("");
      }
      if (comment && comment != "") {
        currentCheck.comment = comment;
        this.refs.CommentBox.setComment("");
      }
    }

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
          /* In the case that we're decrementing the check and now we're out of bounds
            * of the group, we decrement the group.
            */
          else if (newCheckIndex == -1 && currentGroupIndex >= 0) {
            var newGroupLength = groups[currentGroupIndex - 1].checks.length;
            api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', currentGroupIndex - 1);
            api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newGroupLength - 1);
          }
          //invalid indices: don't do anything else
          else {
            return;
          }
        }
      }
      //Save Project
      var commitMessage = 'user: ' + userName + ', namespace: ' + NAMESPACE +
          ', group: ' + currentGroupIndex + ', check: ' + currentCheckIndex;
      api.saveProject(commitMessage);
      // Update state to render the next check
      this.updateState();
  }

  /**
   * @description - This method grabs the information that is currently in the
   * store and uses it to update our state which in turn updates our view. This method is
   * typically called after the store is updated so that our view updates to the latest
   * data found in the store
   */
  updateState() {
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    if (currentGroupIndex === null || currentCheckIndex === null) {
      console.warn("PhraseCheck wasn't able to retrieve it's indices");
      return;
    }
    var currentCheck = api.getDataFromCheckStore(NAMESPACE, 'groups')[currentGroupIndex]['checks'][currentCheckIndex];
    var currentWord = api.getDataFromCheckStore(NAMESPACE, 'groups')[currentGroupIndex].group;
    this.setState({
        book: api.getDataFromCheckStore(NAMESPACE, 'book'),
        currentCheck: currentCheck,
        currentWord: currentWord,
        currentFile: this.getFile(currentWord)
    });
    if (this.refs.CommentBox) {
      this.refs.CommentBox.setComment(currentCheck.comment || "");
      this.refs.ProposedChanges.setNewWord(currentCheck.proposedChanges || "");
    }
    api.emitEvent('goToVerse', {chapterNumber: currentCheck.chapter, verseNumber: currentCheck.verse});
  }

    /**
     * @description - This retrieves the translationAcademy file from the store so that we
     * can pass it as a prop to the TranslationAcademy
     */
  getFile(currentWord) {
    var TranslationAcademyObject = api.getDataFromCheckStore('TranslationAcademy', 'sectionList');
    var file = currentWord  + ".md";
    return TranslationAcademyObject[file].file;
  }

  getVerse(language){
    var currentCheck = this.state.currentCheck;
    var currentVerseNumber = this.state.currentCheck.verse;
    var currentChapterNumber = this.state.currentCheck.chapter;
    var desiredLanguage = api.getDataFromCommon(language);
    if (desiredLanguage){
      return desiredLanguage[currentChapterNumber][currentVerseNumber];
    } else {
      console.error(UNABLE_TO_FIND_LANGUAGE + ": " + language);
    }
  }

  setCurrentCheckProperty(propertyName, propertyValue) {
    this.groups[this.groupIndex].checks[this.checkIndex][propertyName] = propertyValue;
  }

  /**
   * @description - Defines how the entire page will display, minus the Menu and Navbar
   */
  render() {
    if (!this.state.currentCheck) {
      return (<div></div>);
    }
    else {
      var gatewayVerse = this.getVerse('gatewayLanguage');
      var targetVerse = this.getVerse('targetLanguage');
      var checkStatus = this.state.currentCheck.checkStatus;
      return (
        <div>
        <TPane />
        <Row className="show-grid">
          <Col md={6} className="confirm-area" style={{paddingRight: "2.5px"}}>
            <GatewayVerseDisplay
              check={this.state.currentCheck}
              verse={gatewayVerse}
              currentVerse={this.state.currentCheck.book
                        + " " + this.state.currentCheck.chapter
                        + ":" + this.state.currentCheck.verse}
            />
            <TargetVerseDisplay
              verse={targetVerse}
              ref={"TargetVerseDisplay"}
              onWordSelected={this.updateSelectedWords.bind(this)}
              currentVerse={this.state.currentCheck.book
                        + " " + this.state.currentCheck.chapter
                        + ":" + this.state.currentCheck.verse}
              style={{minHeight: '150px', margin: '0 2.5px 5px 0'}}
            />
            <FlagDisplay />
            <ProposedChanges val={this.state.currentCheck.proposedChanges || ""} ref={"ProposedChanges"} />
          </Col>
          <Col md={6} style={{paddingLeft: '2.5px'}}>
            <ConfirmDisplay
              phraseInfo={this.state.currentCheck.phraseInfo}
              phrase={this.state.currentCheck.phrase}
            />
            <TranslationAcademy file={this.state.currentFile} style={{width:"100%", height: "150px"}}/>
          </Col>
          </Row>
        <Row className="show-grid">
        <Col md={12}>
          <CommentBox val={this.state.currentCheck.comment || ""} ref={"CommentBox"} />
        </Col>
        </Row>
        </div>
      );
    }
  }
}

module.exports = {
  name: NAMESPACE,
  view: View
}
