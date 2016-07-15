(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
  const PhraseModuleView = require('../components/modules/phrase_check_module/CheckModuleView');
  const LexicalModuleView = require('../components/modules/lexical_check_module/CheckModuleView');

  const NavMenu = require('../components/core/NavigationMenu');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const TPane = require('../components/core/TPane');

  const NavBarComponent = require('../components/core/NavBarComponent');
  const LoginModal = require('../components/core/LoginModal');
  const UploadModal = require('../components/core/UploadModal');
  const MenuBar = require('../components/core/MenuBar');
  const SettingsModal = require('../components/core/SettingsModal');
  const RootStyles = require('./RootStyle');
  const Grid = require('react-bootstrap/lib/Grid.js');
  const Row = require('react-bootstrap/lib/Row.js');
  const Col = require('react-bootstrap/lib/Col.js');
  const NextButton = require('../components/core/NextButton');
  const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
  const ProposedChanges = require('../components/modules/proposed_changes_module/ProposedChanges.js');

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      var Application = (
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
                <TPane />
                <ProposedChanges />
                <SwitchCheckModuleDropdown />
                {/* <PhraseModuleView /> OR <LexicalModuleView /> */}
                <NextButton style={{float: 'right'}} />
              </Col>
            </Row>
          </Grid>
        </div>
      );
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
