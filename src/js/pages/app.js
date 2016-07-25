  const React = require('react');
  const bootstrap = require('react-bootstrap');


const NavMenu = require('../components/core/NavigationMenu');
const NextButton = require('../components/core/NextButton');
const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
const NavBarComponent = require('../components/core/NavBarComponent');
const LoginModal = require('../components/core/LoginModal');
const SettingsModal = require('../components/core/SettingsModal.js');
const ProjectModal = require('../components/core/create_project/ProjectModal');
const Loader = require('../components/core/Loader');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const OpenProject = require('../components/core/AccessProjectModal.js');

const api = window.ModuleApi;

const CheckStore = require('../stores/CheckStore.js');
const ModuleWrapper = require('../components/modules/ModuleWrapper');

module.exports = (
  <div className='fill-height'>
  <NavBarComponent />
  <SettingsModal />
  <LoginModal />
  <OpenProject />
    <Grid fluid className='fill-height'>
      <Row className='fill-height'>
        <Col className='fill-height' xs={5} sm={4} md={3} lg={2}>
          <NavMenu />
          <ProjectModal />
        </Col>
        <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={10}>
          <Loader />
          <SwitchCheckModuleDropdown />
          <ModuleWrapper />
        </Col>
      </Row>
    </Grid>
  </div>
);
