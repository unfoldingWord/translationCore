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
const Glyphicon = ReactBootstrap.Glyphicon;

// Declare modules that are not defined within our ExampleChecker
// They will be initialized in the constructor
var TPane = null;
var ProposedChanges = null;
var QualityAssurance = null;

const NAMESPACE = 'ExampleChecker';

class View extends api.CheckModule {

  constructor() {
    super();
    
    this.nameSpace = NAMESPACE;

    // Initialize modules that are not defined within our ExampleChecker
    // They will be rendered in the render() function
    TPane = api.getModule('TPane');
    ProposedChanges = api.getModule('ProposedChanges');
    QualityAssurance = api.getModule('QualityAssurance');
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

  render() {
    var _this = this;
    return (
      <div>
        <TPane />
        <Row className='show-grid'>
          <Col sm={6}>
            <QualityAssurance />
          </Col>
          <Col sm={6}>
            <Well>
              <p>Is this verse written in the correct language?</p>
              <ButtonGroup>
                <Button
                  onClick={
                    function() { _this.updateCheckStatus('YES'); }
                  }
                >
                  <span style={{color: 'green'}}>Yes</span>
                </Button>
                <Button
                  onClick={
                    function() { _this.updateCheckStatus('NO'); }
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
