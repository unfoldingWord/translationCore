const React = require('react');
const bootstrap = require('react-bootstrap');

const NavMenu = require('../components/core/NavigationMenu');
const NextButton = require('../components/core/NextButton');
const SwitchCheckModuleDropdown = require('../components/core/SwitchCheckModuleDropdown');
const SideNavBar = require('../components/core/SideBar/SideNavBar');
const LoginModal = require('../components/core/login/LoginModal');
const SwitchCheckModal = require('../components/core/SwitchCheckModal');
const SettingsModal = require('../components/core/SettingsModal.js');
const ProjectModal = require('../components/core/create_project/ProjectModal');
const Loader = require('../components/core/Loader');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');

const Welcome = require('../components/core/welcome/welcome');
const OpenProject = require('../components/core/AccessProjectModal.js');

const AlertModal = require('../components/core/AlertModal');

const api = window.ModuleApi;
const CheckStore = require('../stores/CheckStore.js');
/**
* These are very hard coded right now, but the fetchers and views will be loaded dynamically
* and given parameters acquired from the user. the api will save each module indiviually
* and the checks will be able to require them dynamically
*/

const ModuleWrapper = require('../components/modules/ModuleWrapper');

var Main = React.createClass({
  getInitialState() {
    if (localStorage.getItem('showTutorial') == 'true') {
      return({
        firstTime: true
      })
    } else {
      return({
        firstTime: false
      })
    }
  },

  finishWelcome: function(){
    this.setState({firstTime: false});
  },

  render: function(){
    var _this = this;
    if(this.state.firstTime){
      return(
        <Welcome initialize={this.finishWelcome}/>
      )
    }else{
      return(
        <div className='fill-height'>
        <SettingsModal />
        <LoginModal />
        <SideNavBar />
        <SwitchCheckModal />
          <Grid fluid className='fill-height' style={{marginLeft: '85px'}}>
            <Row className='fill-height'>
              <Col className='fill-height' xs={5} sm={4} md={3} lg={2}>
                <NavMenu />
                <ProjectModal />
              </Col>
              <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={10}>
                <Loader />
                <AlertModal />
                <SwitchCheckModuleDropdown />
                <ModuleWrapper />
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }
});

module.exports = (
    <Main />
);
