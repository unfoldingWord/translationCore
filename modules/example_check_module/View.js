/**
 * An example check module
 */

// Get the Translation Core Module API
const api = window.ModuleApi;

// Get the React and ReactBootstrap libraries from the API
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

// Get Bootstrap elements
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Well = ReactBootstrap.Well;
const Button = ReactBootstrap.Button;
const ButtonGroup = ReactBootstrap.ButtonGroup;

// Declare modules that are not defined within our ExampleChecker
// They will be initialized in the constructor
var TPane = null;
var ProposedChanges = null;
var ExampleTool = null;

const NAMESPACE = 'ExampleChecker';

class View extends api.CheckModule {

  constructor() {
    super();
    
    // Initialize the namespace to be used inside the check store. Required for
    // extending the CheckModule class
    this.nameSpace = NAMESPACE;

    // Initialize modules that are not defined within our ExampleChecker
    // They will be rendered in the render() function
    TPane = api.getModule('TPane');
    ProposedChanges = api.getModule('ProposedChanges');
    ExampleTool = api.getModule('ExampleTool');
  }
  
  /**
   * @description - Implements abstract method required by the CheckModule class.
   * This is called when the user clicks the NextButton or a MenuItem in the NavigationMenu.
   * Gets data from tools that are in the check module view and
   * returns an object with keys and values that will be stored in the current check.
   */
  getDataFromTools() {
    var dataFromTools = {};
    // Get text from proposed changes tool
    var proposedChanges = api.getDataFromCheckStore('ProposedChanges', 'currentChanges');
    // Save proposed changes if the text box is not empty or unchanged
    if (proposedChanges != "" && proposedChanges != this.getVerse('targetLanguage')) {
      dataFromTools.proposedChanges = proposedChanges;
    }
    return dataFromTools;
  }
  
  /**
   * @description - Helper method for retrieving the verse from different languages
   * @param {string} language - string denoting either 'gatewayLanguage' or 'targetLanguage'
   * that will be used to index into the 'common' namespace within CheckStore
   */
  getVerse(language) {
    var currentCheck = this.getCurrentCheck();
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

  render() {
    var _this = this;
    return (
      <div>
        <TPane />
        <Row className='show-grid'>
          <Col sm={6}>
            <ExampleTool />
          </Col>
          <Col sm={6}>
            <Well>
              <p>Is this verse written in the correct language?</p>
              <ButtonGroup>
                <Button
                  onClick={
                    function() { _this.updateCheckStatus('RETAINED'); }
                  }
                >
                  <span style={{color: 'green'}}>Yes</span>
                </Button>
                <Button
                  onClick={
                    function() { _this.updateCheckStatus('WRONG'); }
                  }
                >
                  <span style={{color: 'red'}}>No</span>
                </Button>
              </ButtonGroup>
            </Well>
            <ProposedChanges />
          </Col>
        </Row>
      </div>
    );
  }
}

module.exports = {
  name: NAMESPACE,
  view: View
}
