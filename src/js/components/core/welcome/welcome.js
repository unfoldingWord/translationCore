const React = require('react');

const RB = require('react-bootstrap');
const {Glyphicon, Popover} = RB;
const CoreActions = require('../../../actions/CoreActions.js');
const Login = require('../login/Login');
const StatusBar = require('../SideBar/StatusBar');
const SideBarContainer = require('../SideBar/SideBarContainer');
const Upload = require('../Upload');

const NUM_OF_SLIDES = 2;

// ToDo This file appears to be obsolete. It should be removed.

const Styles = {
  navButtons: {
    float: 'right',
    margin: '0px 50px',
    height: '50px',
    alignSelf: 'center',
    fontSize: '200%',
    color: 'var(--reverse-color)'
  },
  menuButtons: {
    width: '25%',
    margin: '5px'
  },
  welcomePage: {
    width: '100%',
    margin: 'auto',
    alignSelf: 'center',
    textAlign: 'center',
    color: 'var(--reverse-color)'
  },
  tutorialPage: {
    backgroundColor: 'var(--background-color)',
    height: '100%'
  },
  skipTutorialButton: {
    color: 'var(--reverse-color)',
    float: 'right',
    margin: '20px'
  },
  nextTutorialButton: {
    color: 'var(--text-color-dark)',
    float: 'right'
  },
  tutorialPopover: {
    maxWidth: '200px'
  },
  welcomeFrame: {
    backgroundColor: 'var(--background-color-dark)',
    height: '100%',
    display: 'flex'
  },
  bigGlyph: {
    color: 'var(--reverse-color)',
    fontSize: '1000%'
  },
  loginBox: {
    width: '50%',
    margin: 'auto'
  },
  uploadBox: {
    width: '50%',
    margin: 'auto',
    backgroundColor: 'var(--reverse-color)',
    borderRadius: '5px'
  },
  tutorialInfo: {
    fontSize: '1.5em'
  }
}

class Welcome extends React.Component{

  constructor(){
    super();

    this.state = {
      index: 1,
      tutorial: false,
      ImportProjectIntroPage: false,
      tutorialIndex: 1,
    }

    this.getPage = this.getPage.bind(this);
    this.setIndex = this.setIndex.bind(this);
    this.getTutorialOverlay = this.getTutorialOverlay.bind(this);
  }

  setIndex(e){
    this.setState({
      index: e
    });
  }

  getPage(e){
    switch(e){
      case 1:
        return (
          <div style={Styles.welcomePage}>
            <img src="./images/TC_Icon_White.png" />
            <h1>Welcome to translationCore</h1>
            <p style={Styles.tutorialInfo}>We are glad that you are here. We just need to set up a few things before we can begin.</p>
          </div>
        )
        break;
      case 2:
        return(
          <div style={Styles.welcomePage}>
            <Glyphicon style={Styles.bigGlyph} glyph="user" />
            <h1>Connect a Door43 account</h1>
            <p style={Styles.tutorialInfo}>
              Connecting your Door43 account to translationCore allows you to upload and save your projects's changes to your account.
              If you don't already have a Door43 account, you can create an account by clicking the register link below.
            </p>
            <div style={Styles.loginBox}>
              <Login success={() => {
                  if(this.state.index == NUM_OF_SLIDES){
                    this.setState({tutorial: true})
                  }else {
                    this.setState({index: this.state.index+1})
                  }
                }
              }/>
            </div>
          </div>
        )
        break;
    }
  }

  getImportProjectIntro(){
    return(
      <div style={Styles.welcomeFrame}>
        <div style={Styles.welcomePage}>
        <Glyphicon style={Styles.bigGlyph} glyph="cloud-download" />
          <h1>Load your first project</h1>
          <p style={Styles.tutorialInfo}>You can load in your first project from Door43 or from your local storage.</p>
            <button onClick={this.props.initialize}>Load Project</button>
        </div>
      </div>
    );
  }

  getTutorialOverlay(e){
    var _this = this;
    switch(e){
      case 1:
        return(
          <Popover
            id="accountSettings"
            placement="right"
            positionLeft={115}
            positionTop={28}
            title="Door43 Login">
            <div style={Styles.tutorialPopover}>
              <p>Clicking this button allows you to log in or log out to your Door43 account. Additionally giving you access to more information about your account.</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={() => {_this.setState({tutorialIndex: this.state.tutorialIndex+1})}}
              >
              {'Next'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
      case 2:
        return(
          <Popover
            id="syncProject"
            placement="right"
            positionLeft={115}
            positionTop={125}
            title="Sync Your Work To Door43">
            <div style={Styles.tutorialPopover}>
              <p>Clicking this button allows you to save or update a copy of your project to your Door43 account.</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={() => {_this.setState({tutorialIndex: this.state.tutorialIndex+1})}}
              >
              {'Next'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
      case 3:
        return(
          <Popover
            id="generateReport"
            placement="right"
            positionLeft={115}
            positionTop={192}
            title="Generating a Report">
            <div style={Styles.tutorialPopover}>
              <p>Clicking this button allows you to generate a report for all of the checks performed in the currently opened project.</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={() => {_this.setState({tutorialIndex: this.state.tutorialIndex+1})}}
              >
            {'Next'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
      case 4:
        return(
          <Popover
            id="appSettings"
            placement="right"
            positionLeft={115}
            positionTop={255}
            title="Settings">
            <div style={Styles.tutorialPopover}>
              <p>Clicking this button allows you to access various settings options to make translationCore look and perform according to your needs.</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={() => {_this.setState({tutorialIndex: this.state.tutorialIndex+1})}}
              >
              {'Next'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
      case 5:
        return(
          <Popover
            id="toolBox"
            placement="right"
            positionLeft={115}
            positionTop={349}
            title="Toolbox">
            <div style={Styles.tutorialPopover}>
              <p>Clicking this button allows you to download, update or remove tools to perform different types of checks.</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={() => {_this.setState({tutorialIndex: this.state.tutorialIndex+1})}}
              >
              {'Next'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
      case 6:
        return(
          <Popover
            id="openProject"
            placement="right"
            positionLeft={115}
            positionTop={window.innerHeight-250}
            title="Load in a Project">
            <div style={Styles.tutorialPopover}>
              <p>{"Clicking this button allows you to import your own or someone else's translationStudio project as well as open an existing translationCore project."}</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={() => {_this.setState({tutorialIndex: this.state.tutorialIndex+1})}}
              >
              {'Next'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
      case 7:
        return(
          <Popover
            id="loadApp"
            placement="right"
            positionLeft={115}
            positionTop={window.innerHeight-150}
            title="Selecting a Tool to perform a Check">
            <div style={Styles.tutorialPopover}>
              <p>Clicking this button allows you to start using a tool to perform a check on your project draft.</p>
            </div>
            <button
              style={Styles.nextTutorialButton}
              onClick={this.skipToProjectPage.bind(this)}
              >
              {'Done'} <Glyphicon glyph="chevron-right" />
            </button>
          </Popover>
        )
      break;
  }
}

  skipToProjectPage(){
    this.setState({ImportProjectIntroPage: true});
  }

  render(){
    var _this = this;
    if(this.state.ImportProjectIntroPage){
      return(
        this.getImportProjectIntro()
      );
    }else if(this.state.tutorial){
      return(
        <div style={Styles.tutorialPage}>
         <StatusBar />
         <SideBarContainer initShow={true}/>
          {this.getTutorialOverlay(this.state.tutorialIndex)}
          <button
            style={Styles.skipTutorialButton}
            onClick={this.skipToProjectPage.bind(this)}
            >
            {'Skip'} <Glyphicon glyph="chevron-right" />
          </button>
        </div>
      )
    } else {
      return(
        <div style={Styles.welcomeFrame}>

          <button
            onClick={
              ()=>{
                //If you are on the first slide you cant go backwards
                if(this.state.index == 1){
                  return;
                } else {
                  _this.setState({index:this.state.index-1})
                }
              }
            }
            style={Styles.navButtons}
          >
            <Glyphicon glyph='chevron-left'
                       style={{
                         display: this.state.index == 1 ? "none" : "inline"
                       }}/>
          </button>

          {this.getPage(this.state.index)}

          <button
            onClick={ () => {
                if(this.state.index == NUM_OF_SLIDES){
                  _this.setState({tutorial: true})
                } else {
                  _this.setState({index: this.state.index+1})
                }
              }
            }
            style={Styles.navButtons}
          >
            <Glyphicon glyph='chevron-right' />
          </button>

        </div>
      )
    }
  }
}

module.exports = Welcome
