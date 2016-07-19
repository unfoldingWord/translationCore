  const React = require('react');
  const bootstrap = require('react-bootstrap');
// const NavBarComponent = require('../components/core/NavBarComponent');

// const NavMenu = require('../components/core/NavigationMenu');

// const LoginModal = require('../components/core/LoginModal');

// const SettingsModal = require('../components/core/SettingsModal');
// const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
// const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');

const api = window.ModuleApi;

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
const phraseFetcher = require(window.__base + "modules/phrase_check_module/FetchData.js");
phraseFetcher(params, function() {}, function() {api.emitEvent('updateGatewayLanguage');} ); 
const Phrase = require(window.__base + "modules/phrase_check_module/View.js");

const tAFetcher = require(window.__base + "modules/translation_academy/FetchData.js")
tAFetcher(params, function() {}, function(err) {
  if (err) {
    console.error(err);
  }
  
  api.emitEvent("changeTranslationAcademySection", {sectionName: "choose_team.md"})
});

const tADisplay = require(window.__base + "modules/translation_academy/View.js")

api.saveModule('TADisplay', tADisplay);

const lexicalFetcher = require(window.__base + "modules/lexical_check_module/FetchData.js");
lexicalFetcher(params, function() {}, function(error) { if (error) console.error(error); api.emitEvent('updateGatewayLanguage');
console.dir(api.getDataFromCheckStore('LexicalCheck', 'groups'));} ); 
const Lexical = require(window.__base + "modules/lexical_check_module/View.js");

module.exports = (
  <div>
    <Lexical />
  </div>
);