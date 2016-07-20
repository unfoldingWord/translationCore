  const React = require('react');
  const bootstrap = require('react-bootstrap');


const NavMenu = require('../components/core/NavigationMenu');
const NextButton = require('../components/core/NextButton');
const NavBarComponent = require('../components/core/NavBarComponent');
const LoginModal = require('../components/core/LoginModal');
const UploadModal = require('../components/core/UploadModal.js');
const SettingsModal = require('../components/core/SettingsModal.js');
// const RootStyles = require('./RootStyle');
const ProjectModal = require('../components/core/ProjectModal');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
// const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');

const api = window.ModuleApi;

const CheckStore = require('../stores/CheckStore.js');
/**
 * These are very hard coded right now, but the fetchers and views will be loaded dynamically
 * and given parameters acquired from the user. the api will save each module indiviually
 * and the checks will be able to require them dynamically
 */

 var params = {
  targetLanguagePath: window.__base + "test_files/Import From TS/",
  originalLanguagePath: window.__base + "data/ulgb",
  bookAbbr: "2ti"
};
const fetcher = require(window.__base + "modules/t_pane/FetchData.js");
fetcher(params, function(){ },
  function() { api.emitEvent('updateTargetLanguage');
  api.emitEvent('updateOriginalLanguage');} );
const TPane = require(window.__base + "modules/t_pane/View");
api.saveModule('TPane', TPane);
const phraseFetcher = require(window.__base + "/modules/phrase_check_module/FetchData.js");
phraseFetcher(params, function() {}, function() {
  api.emitEvent('updateGatewayLanguage');
  api.emitEvent('changeCheckType', {currentCheckData: api.getDataFromCheckStore("PhraseCheck")});
});
const Phrase = require(window.__base + "modules/phrase_check_module/View.js");

const tAFetcher = require(window.__base + "modules/translation_academy/FetchData.js");
tAFetcher(params, function() {}, function(sectionFileNamesToTitles, err) {
  if (err) {
    console.error(err);
  }
  api.emitEvent("changeGroupHeaders", sectionFileNamesToTitles);
  api.emitEvent("changeTranslationAcademySection", {sectionName: "choose_team.md"})
});

const tADisplay = require(window.__base + "modules/translation_academy/View.js")
api.saveModule('TADisplay', tADisplay);


// const lexicalFetcher = require(window.__base + "modules/lexical_check_module/FetchData.js");
// lexicalFetcher(params, function() {}, function(error) { 
//   if (error) console.error(error); 
//   api.emitEvent('updateGatewayLanguage');
//   api.emitEvent('changeCheckType', {currentCheckData: api.getDataFromCheckStore("LexicalCheck")});
// }); 
// const Lexical = require(window.__base + "modules/lexical_check_module/View.js");

const pFetcher = require(window.__base + "modules/proposed_changes_module/FetchData.js");
pFetcher(params, function() {}, function() {});

const ProposedChanges = require(window.__base + "modules/proposed_changes_module/View.js")
api.saveModule('ProposedChanges', ProposedChanges);



module.exports = (
  <div>
  <NavBarComponent />
  <UploadModal />
  <SettingsModal />
  <LoginModal />
    <Grid fluid>
      <Row>
        <Col style={RootStyles.ScrollableSection} md={2} sm={2}>
          <NavMenu />
          <ProjectModal />
        </Col>
      </Row>
      <Row>
        <Col style={RootStyles.ScrollableSection} xs={10} md={10} lg={10} xsOffset={2} mdOffset={2}>
          <Phrase />
          <NextButton />
        </Col>
      </Row>
    </Grid>
  </div>
);
