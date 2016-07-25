//View.js//

//Api Consts
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

//Modules not defined within lexical_check_module
var TPane = null;
var ProposedChanges = null;
const CommentBox = null; //api.getModule('CommentBox');

//Bootstrap consts
const Well = ReactBootstrap.Well;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Button = ReactBootstrap.Button;
const ButtonGroup = ReactBootstrap.ButtonGroup;
const Glyphicon = ReactBootstrap.Glyphicon;

//Modules that are defined within lexical_check_module
const TranslationWordsDisplay = require('./translation_words/TranslationWordsDisplay');
const TargetVerseDisplay = require('./TargetVerseDisplay.js');
const GatewayVerseDisplay = require('./GatewayVerseDisplay.js');
const WordComponent = require('./WordComponent.js');
const EventListeners = require('./ViewEventListeners.js');

//String constants
const NAMESPACE = "LexicalChecker",
  UNABLE_TO_FIND_LANGUAGE = "Unable to find language from the store",
  UNABLE_TO_FIND_ITEM_IN_STORE = "Unable to find key in namespace",
  UNABLE_TO_FIND_WORD = "Unable to find wordobject",
  RETAINED = "Correct in Context",
  WRONG = "Flag for Review";
//Other constants
const extensionRegex = new RegExp('\\.\\w+\\s*$');

/**
 * @description - This class defines the entire view for the Lexical Check Module
 */
class View extends React.Component {
	constructor() {
		super();
    this.state = {
        currentCheck: null,
        currentTranslationWordFile: null
    }
    TPane = api.getModule('TPane');
    ProposedChanges = api.getModule('ProposedChanges');

    this.updateState = this.updateState.bind(this);
    this.changeCurrentCheckInCheckStore = this.changeCurrentCheckInCheckStore.bind(this);
    this.updateCheckStatus = this.updateCheckStatus.bind(this);
    this.goToNextListener = EventListeners.goToNext.bind(this);
    this.goToCheckListener = EventListeners.goToCheck.bind(this);
    this.changeCheckTypeListener = EventListeners.changeCheckType.bind(this);
	}

  /**
   * @description - This method is a lifecycle method of a react component and will
   * be called before the component mounts to the DOM. It's used to register event and action
   * callbacks using the API
   */
	componentWillMount() {

    //This action will update our indexes in the store
    api.registerAction('changeLexicalCheck', this.changeCurrentCheckInCheckStore);

    //This action will update the status of the check that is the current check in the CheckStore
    api.registerAction('updateCheckStatus', this.updateCheckStatus);

    /*
     * This event will call an action that increment the checkIndex by one,
     * and might increment the group index if needed. Because no parameters are given
     * from the event, we have to get the current indexes from the store and increment it
     * manually before sending the action to update the store
     */
    api.registerEventListener('goToNext', this.goToNextListener);

    /*
     * This event listens for an event that will tell us another check to go to,
     * and sends the appropriate action. This and the above listener need to be two
     * seperate listeners because the 'gotoNext' event won't have parameters attached to it
     */
    api.registerEventListener('goToCheck', this.goToCheckListener);

    /**
     * This event listens for an event to change the check type, checks if we're switching to
     * LexicalCheck, then updates our state if we are
     */
    api.registerEventListener('changeCheckType', this.changeCheckTypeListener);

    this.updateState();
  }

  componentWillUnmount() {
    api.removeAction('changeLexicalCheck', this.changeCurrentCheckInCheckStore);
    api.removeAction('updateCheckStatus', this.updateCheckStatus);

    api.removeEventListener('goToNext', this.goToNextListener);

    api.removeEventListener('goToCheck', this.goToCheckListener);
    api.removeEventListener('changeCheckType', this.changeCheckTypeListener);
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
    if (currentCheck.checkStatus) {
      currentCheck.checkStatus = action.checkStatus;
      api.emitEvent('changedCheckStatus', {currentCheckNamespace: NAMESPACE});
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
  changeCurrentCheckInCheckStore(lexicalData, action) {
      //error check to make sure we're going to a legal group/check index
      if (action.checkIndex !== undefined && action.groupIndex !== undefined) {
        if (action.groupIndex < lexicalData.groups.length) {
          lexicalData.currentGroupIndex = action.groupIndex;
          if (action.checkIndex < lexicalData.groups[lexicalData.currentGroupIndex].checks.length) {
            lexicalData.currentCheckIndex = action.checkIndex;
          }
          /* In the case that we're incrementing the check and now we're out of bounds
           * of the group, we increment the group.
           */
          else if (action.checkIndex == lexicalData.groups[lexicalData.currentGroupIndex].checks.length &&
            lexicalData.currentGroupIndex < lexicalData.groups.length - 1) {
            lexicalData.currentGroupIndex++;
            lexicalData.currentCheckIndex = 0;
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
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    if (currentGroupIndex === null || currentCheckIndex === null) {
      console.warn("LexicalCheck wasn't able to retrieve its indices");
      return;
    }
    var currentCheck = api.getDataFromCheckStore(NAMESPACE, 'groups')[currentGroupIndex]['checks'][currentCheckIndex];
    var currentWord = api.getDataFromCheckStore(NAMESPACE, 'groups')[currentGroupIndex].group;
    this.setState({
        currentCheck: currentCheck,
        currentWord: currentWord,
        currentFile: this.getWordFile(currentWord)
    });
    api.emitEvent('goToVerse', {chapterNumber: currentCheck.chapter, verseNumber: currentCheck.verse});
  }

  /**
   * @description - This retrieves the translationWord file from the store so that we
   * can pass it as a prop to the translationWords display
   */
  getWordFile(word) {
    var wordObject = this.getWordObject(word);
    if (wordObject && wordObject.file) {
      return wordObject.file;
    }
    else {
      console.error(UNABLE_TO_FIND_WORD + ": " + word);
    }
  }

  /**
   * @description - This is a helper method to get a prepoccessed word's data
   * @param {string} word - the word's object to be retrieved from the CheckStore
   */
  getWordObject(word) {
    var wordList = api.getDataFromCheckStore(NAMESPACE, 'wordList');
    if (wordList) {
      var wordObject = search(wordList, function(item) {
          return stringCompare(word ,item.name);
      });
      return wordObject;
    }
    else {
      console.error(UNABLE_TO_FIND_ITEM_IN_STORE + ": wordList");
    }
  }

  /**
   * @description - Helper method for retrieving the verse from different languages
   * @param {string} language - string denoting either 'gatewayLanguage' or 'targetLanguage'
   * that will be used to index into the 'common' namespace within CheckStore
   */
  getVerse(language) {
    var currentCheck = this.state.currentCheck;
    var currentVerseNumber = currentCheck.verse;
    var currentChapterNumber = currentCheck.chapter;
    var actualLanguage = api.getDataFromCommon(language);
    if (actualLanguage) {
      return actualLanguage[currentChapterNumber][currentVerseNumber];
    }
    else {
      console.error(UNABLE_TO_FIND_LANGUAGE + ": " + language);
    }
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
  		return (
  			<div>
  				<TPane />
          <Row className="show-grid">
            <Col sm={3} md={3} lg={3}
            style={{
              textAlign: "center"
            }}
          >
              <WordComponent word={this.state.currentWord.replace(extensionRegex, '')} />
            </Col>
            <Col
              sm={3} md={3} lg={3}
              style={{
                textAlign: "center"
              }}
            >
              <Well bsSize={'small'} style={{
                height: "60px",
                lineHeight:'35px'}}>{this.state.currentCheck.book + ' ' +
                this.state.currentCheck.chapter + ":" + this.state.currentCheck.verse}</Well>
            </Col>
          </Row>
          <Row className="show-grid">
            <Col sm={6} md={6} lg={6}>
              <TranslationWordsDisplay file={this.state.currentFile}/>
            </Col>
            <Col sm={6} md={6} lg={6}>
              <GatewayVerseDisplay
                wordObject={this.getWordObject(this.state.currentWord)}
                verse={gatewayVerse}
              />
              <TargetVerseDisplay
                verse={targetVerse}
                buttonEnableCallback={()=>{}}
                buttonDisableCallback={()=>{}}
              />
              <ButtonGroup style={{width:'100%'}}>
                <Button style={{width:'50%'}} onClick={
                    function() {
                      api.sendAction({
                        type: 'updateCheckStatus',
                        field: 'LexicalChecker',
                        checkStatus: 'RETAINED'
                      })
                    }
                  }><span style={{color: "green"}}><Glyphicon glyph="ok" /> {RETAINED}</span></Button>
                <Button style={{width:'50%'}} onClick={
                    function() {
                      api.sendAction({
                        type: 'updateCheckStatus',
                        field: 'LexicalChecker',
                        checkStatus: 'WRONG'
                      });
                    }
                  }
                ><span style={{color: "red"}}><Glyphicon glyph="remove" /> {WRONG}</span></Button>
              </ButtonGroup>
              <br /><br />
              <ProposedChanges />
            </Col>
          </Row>
  			</div>
  		);
  	}
  }
}


/**
* Compares two string alphabetically
* @param {string} first - string to be compared against
* @param {string} second - string to be compared with
*/
function stringCompare(first, second) {
  if (first < second) {
    return -1;
  }
  else if (first > second) {
    return 1;
  }
else {
    return 0;
  }
}

/**
* @description - Binary search of the list. I couldn't find this in the native methods of an array so
* I wrote it
* @param {array} list - array of items to be searched
* @param {function} boolFunction - returns # < 0, # > 0. or 0 depending on which path the
* search should take
* @param {int} first - beginnging of the current partition of the list
* @param {int} second - end of the current partition of the list
*/
function search(list, boolFunction, first = 0, last = -1) {
  if (last == -1) {
    last = list.length;
  }
  if (first > last) {
    return;
  }
  var mid = Math.floor(((first - last) * 0.5)) + last;
  var result = boolFunction(list[mid]);
  if (result < 0) {
    return search(list, boolFunction, first, mid - 1);
  }
  else if (result > 0) {
    return search(list, boolFunction, mid + 1, last);
  }
else {
    return list[mid];
  }
}

module.exports = {
  name: NAMESPACE,
  view: View
}
