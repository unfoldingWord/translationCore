  const React = require('react');
const NavBarComponent = require('../components/core/NavBarComponent');
const PhraseModuleView = require('../components/modules/phrase_check_module/CheckModuleView');
const LexicalModuleView = require('../components/modules/lexical_check_module/CheckModuleView');

const NavMenu = require('../components/core/NavigationMenu');
const TPane = require('../components/core/TPane');


const LoginModal = require('../components/core/LoginModal');
const UploadModal = require('../components/core/UploadModal');

const SettingsModal = require('../components/core/SettingsModal');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const NextButton = require('../components/core/NextButton');
const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
const ProposedChanges = require('../components/modules/proposed_changes_module/ProposedChanges.js');

module.exports = (
  <div>
    <NavBarComponent />
    <LoginModal />
    <UploadModal />
    <Grid fluid>
      <Row>
        <Col style={RootStyles.SideMenu} md={2} sm={2}>
          <SettingsModal />
          <NavMenu />
        </Col>
      </Row>
      <Row>
        <Col style={RootStyles.CheckSection} xs={10} md={10} lg={10} xsOffset={2} mdOffset={2}>
          <SwitchCheckModuleDropdown />
          <TPane />
          <ProposedChanges />
          <PhraseModuleView />
          {/* <PhraseModuleView /> OR <LexicalModuleView /> */}
          <NextButton style={{float: 'right'}} />
        </Col>
      </Row>
    </Grid>
  </div>
);
