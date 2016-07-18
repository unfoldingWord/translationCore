  const React = require('react');
  const bootstrap = require('react-bootstrap');
// const NavBarComponent = require('../components/core/NavBarComponent');
// const PhraseModuleView = require('../components/modules/phrase_check_module/CheckModuleView');
// const LexicalModuleView = require('/home/samuel_faulkner/Documents/modules/CheckModuleView');

// const NavMenu = require('../components/core/NavigationMenu');
// const TPane = require('../components/core/TPane');


// const LoginModal = require('../components/core/LoginModal');

// const SettingsModal = require('../components/core/SettingsModal');
// const RootStyles = require('./RootStyle');
// const Grid = require('react-bootstrap/lib/Grid.js');
// const Row = require('react-bootstrap/lib/Row.js');
// const Col = require('react-bootstrap/lib/Col.js');
// const NextButton = require('../components/core/NextButton');
// const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');

const api = window.ModuleApi;

/**
 * These are very hard coded right now, but the fetchers and views will be loaded dynamically 
 * and given parameters acquired from the user. the api will save each module indiviually 
 * and the checks will be able to require them dynamically 
 */

 var params = {
  targetLanguagePath: "/home/samuel_faulkner/Documents/8woc/test_files/Import From TS/",
  originalLanguagePath: "/home/samuel_faulkner/Documents/8woc/data/ulgb",
  bookAbbr: "2ti"
};
const fetcher = require("/home/samuel_faulkner/Documents/8woc/modules/t_pane/FetchData.js");
fetcher(params, function(){ }, 
  function() { api.emitEvent('updateTargetLanguage'); 
  api.emitEvent('updateOriginalLanguage');} );
const TPane = require("/home/samuel_faulkner/Documents/8woc/modules/t_pane/View");
api.saveModule('TPane', TPane);
const phraseFetcher = require("/home/samuel_faulkner/Documents/8woc/modules/phrase_check_module/FetchData.js");
phraseFetcher(params, function() {}, function() {api.emitEvent('updateGatewayLanguage');} ); 
const Phrase = require("/home/samuel_faulkner/Documents/8woc/modules/phrase_check_module/View.js");

// const lexicalFetcher = require("/home/samuel_faulkner/Documents/modules/lexical_check_module/FetchData.js");
// lexicalFetcher(params, function() {}, function() {api.emitEvent('updateGatewayLanguage');} ); 
// const Lexical = require("/home/samuel_faulkner/Documents/modules/lexical_check_module/View.js");

module.exports = (
  <div>
// <<<<<<< HEAD
    <Phrase />
// =======
//     <NavBarComponent />
//     <LoginModal />
//     <UploadModal />
//     <Grid fluid>
//       <Row>
//         <Col style={RootStyles.SideMenu} md={2} sm={2}>
//           <SettingsModal />
//           <NavMenu />
//         </Col>
//       </Row>
//       <Row>
//         <Col style={RootStyles.CheckSection} xs={10} md={10} lg={10} xsOffset={2} mdOffset={2}>
//           <SwitchCheckModuleDropdown />
//           <TPane />
//           <PhraseModuleView />
//           {/* <PhraseModuleView /> OR <LexicalModuleView /> */}
//           <NextButton style={{float: 'right'}} />
//         </Col>
//       </Row>
//     </Grid>
// >>>>>>> develop
  </div>
);