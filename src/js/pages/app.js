  const React = require('react');
  const bootstrap = require('react-bootstrap');


const NavMenu = require('../components/core/NavigationMenu');
const NextButton = require('../components/core/NextButton');
const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
const NavBarComponent = require('../components/core/NavBarComponent');
const LoginModal = require('../components/core/LoginModal');
const SettingsModal = require('../components/core/SettingsModal.js');
// const RootStyles = require('./RootStyle');
const ProjectModal = require('../components/core/ProjectModal');
const Loader = require('../components/core/Loader');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');

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

const ModuleWrapper = require('../components/modules/ModuleWrapper');

module.exports = (
  <div>
  <NavBarComponent />
  <SettingsModal />
  <LoginModal />
    <Grid fluid>
      <Row>
        <Col style={RootStyles.ScrollableSection} xs={2} sm={2} md={2} lg={2}>
          <NavMenu />
          <ProjectModal />
        </Col>
      </Row>
      <Row>
        <Col style={RootStyles.ScrollableSection} xs={10} sm={10} md={10} lg={10} xsOffset={2} mdOffset={2}>
          <Loader />  
          <SwitchCheckModuleDropdown />
          <ModuleWrapper />
        </Col>
      </Row>
    </Grid>
  </div>
);
