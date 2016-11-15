/**
 * checkingRubric Tool module
 */

 //Modules not defined within checkingRubric
const api = window.ModuleApi;
const React = api.React;

// Declare modules that are not defined within our checkingRubric
// Will be initialized in the constructor
var TPane = null;
var CommentBox = null;
//Bootstrap consts
const RB = api.ReactBootstrap;
const {Row} = RB;

//Modules that are defined within checkingRubric
const EventListeners = require('./ViewEventListeners.js');
const TargetChapterDisplay = require('./subcomponents/TargetChapterDisplay.js');
const Rubric = require('./subcomponents/Rubric.js');
const style = require('./css/style.js');

//String constants
const NAMESPACE = 'checkingRubricTool';

/**
 * @description - This class defines the view for checkingRubric Tool module

 */

class View extends React.Component {
  constructor() {
    super();
    this.state = {
      currentCheck: null,
      currentGroup: null,
      currentQuestionsList: null,
    }
    TPane = api.getModule('TPane');
    CommentBox = api.getModule('CommentBox');

    this.updateState = this.updateState.bind(this);
    this.goToNextListener = EventListeners.goToNext.bind(this);
    this.goToPreviousListener = EventListeners.goToPrevious.bind(this);
    this.goToCheckListener = EventListeners.goToCheck.bind(this);
    this.changeCheckTypeListener = EventListeners.changeCheckType.bind(this);
  }

  componentWillMount() {
    this.updateState();
    api.registerEventListener('goToNext', this.goToNextListener);
    api.registerEventListener('goToPrevious', this.goToPreviousListener);
    api.registerEventListener('goToCheck', this.goToCheckListener);
    api.registerEventListener('changeCheckType', this.changeCheckTypeListener);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.goToNextListener);
    api.removeEventListener('goToPrevious', this.goToPreviousListener);
    api.removeEventListener('goToCheck', this.goToCheckListener);
    api.removeEventListener('changeCheckType', this.changeCheckTypeListener);
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
      console.warn("checkingRubric tool wasn't able to retrieve it's indices");
      return;
    }
    var currentGroup = api.getDataFromCheckStore(NAMESPACE, 'groups')[currentGroupIndex]['group'];
    var currentCheck = api.getDataFromCheckStore(NAMESPACE, 'groups')[currentGroupIndex]['checks'][currentCheckIndex];
    var emitEvent = function() {
            api.emitEvent('goToVerse', { chapterNumber: currentCheck.chapter, verseNumber: currentCheck.verse});
            }
    this.setState({
      book: api.getDataFromCheckStore(NAMESPACE, 'book'),
      currentCheck: currentCheck,
      currentGroup: currentGroup
    }, emitEvent());
    this.getCurrentQuestionsList(currentGroup);
  }

 changeCurrentCheckInCheckStore(newGroupIndex, newCheckIndex) {
  let loggedInUser = api.getLoggedInUser();
  let userName = loggedInUser ? loggedInUser.userName : 'GUEST_USER';

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
      this.updateState();
    }

  /**
   * @description - Helper method for retrieving the verse from different languages
   * @param {string} language - string denoting either 'gatewayLanguage' or 'targetLanguage'
   * that will be used to index into the 'common' namespace within CheckStore
   */
  getTargetChapter() {
    var currentCheck = this.state.currentCheck;
    var currentChapterNumber = currentCheck.chapter;
    var targetLanguage = api.getDataFromCommon('targetLanguage');
    try {
      if (targetLanguage) {
        return targetLanguage[currentChapterNumber];
      }
    }catch(e){}
  }

  getCurrentQuestionsList(currentGroup){
    let questionsList = require('./static/QuestionsList.json').questionsList;
    let currentQuestionsList = questionsList.find(arrayElement => arrayElement.group === currentGroup);
    this.setState({currentQuestionsList: currentQuestionsList});
   }

  render() {
    return (
      <div>
        <TPane />
         <Row className="show-grid" style={{marginTop: '25px'}}>
          <h3 style={style.toolName}>
            <span style={{color: '#44c6ff'}}>
              checkingRubric
            </span> Tool
          </h3>
          <TargetChapterDisplay getTargetChapter={this.getTargetChapter.bind(this)}
                                currentChapter={this.state.currentCheck.chapter}
                                book={this.state.book}/>
          <Rubric currentCheck={this.state.currentCheck}
                  currentGroup={this.state.currentGroup}
                  currentQuestionsList={this.state.currentQuestionsList}/>
        </Row>
        <Row className="show-grid" style={{marginTop: '0px'}}>
          <CommentBox />
        </Row>
      </div>
    );
  }
}


module.exports = {
  name: NAMESPACE,
  view: View
}
