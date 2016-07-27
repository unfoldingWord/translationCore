const React = require('react');
const bootstrap = require('react-bootstrap');

const NavMenu = require('../components/core/NavigationMenu');
const NextButton = require('../components/core/NextButton');
const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
const SideNavBar = require('../components/core/SideBar/SideNavBar');
const LoginModal = require('../components/core/login/LoginModal');
const SettingsModal = require('../components/core/SettingsModal.js');
const ProjectModal = require('../components/core/create_project/ProjectModal');
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

const ModuleWrapper = require('../components/modules/ModuleWrapper');
module.exports = (

  <div className='fill-height'>
  <SettingsModal />
  <LoginModal />
  <SideNavBar />
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
