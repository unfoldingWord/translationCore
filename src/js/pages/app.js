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

const tAFetcher = require("/home/samuel_faulkner/Documents/8woc/modules/translation_academy/FetchData.js")
tAFetcher(params, function() {}, function(err) {
  if (err) {
    console.error(err);
  }
  console.log('Callback fired');
  console.dir(api.getDataFromCheckStore('TranslationAcademy', 'sectionList'));
  api.emitEvent("changeTranslationAcademySection", {sectionName: "choose_team.md"})
});

const tADisplay = require("/home/samuel_faulkner/Documents/8woc/modules/translation_academy/View.js")

api.saveModule('TADisplay', tADisplay);

// const lexicalFetcher = require("/home/samuel_faulkner/Documents/modules/lexical_check_module/FetchData.js");
// lexicalFetcher(params, function() {}, function() {api.emitEvent('updateGatewayLanguage');} ); 
// const Lexical = require("/home/samuel_faulkner/Documents/modules/lexical_check_module/View.js");

module.exports = (
  <div>
    <Phrase />
  </div>
);