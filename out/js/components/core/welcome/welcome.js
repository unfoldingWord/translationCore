const React = require('react');

const RB = require('react-bootstrap');
const { Glyphicon, Button, Popover } = RB;

const Login = require('../login/Login');
const Upload = require('../Upload');
const SideNavBar = require('../SideBar/SideNavBar');

const NUM_OF_SLIDES = 3;

const Styles = {
  navButtons: {
    float: 'right',
    margin: '0px 50px',
    height: '50px',
    alignSelf: 'center',
    fontSize: '200%',
    color: '#fff'
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
    color: '#fff'
  },
  tutorialPage: {
    backgroundColor: '#4d4d4d',
    height: '100%'
  },
  skipTutorialButton: {
    color: '#fff',
    float: 'right',
    margin: '20px'
  },
  nextTutorialButton: {
    color: '#000',
    float: 'right'
  },
  tutorialPopover: {
    maxWidth: '200px'
  },
  welcomeFrame: {
    backgroundColor: '#1a2133',
    height: '100%',
    display: 'flex'
  },
  bigGlyph: {
    color: '#fff',
    fontSize: '1000%'
  },
  loginBox: {
    width: '50%',
    margin: 'auto'
  },
  uploadBox: {
    width: '50%',
    margin: 'auto',
    backgroundColor: '#fff',
    borderRadius: '5px'
  },
  tutorialInfo: {
    fontSize: '1.5em'
  }
};

class Welcome extends React.Component {

  constructor() {
    super();

    this.state = {
      index: 1,
      tutorial: false,
      tutorialIndex: 1
    };

    this.getPage = this.getPage.bind(this);
    this.setIndex = this.setIndex.bind(this);
    this.getTutorialOverlay = this.getTutorialOverlay.bind(this);
  }

  setIndex(e) {
    this.setState({
      index: e
    });
  }

  getPage(e) {
    switch (e) {
      case 1:
        return React.createElement(
          'div',
          { style: Styles.welcomePage },
          React.createElement('img', { src: './images/TC_Icon_White.png' }),
          React.createElement(
            'h1',
            null,
            'Welcome to translationCore'
          ),
          React.createElement(
            'p',
            { style: Styles.tutorialInfo },
            'We are glad that you are here. We just need to set up a few things before we can begin.'
          )
        );
        break;
      case 2:
        return React.createElement(
          'div',
          { style: Styles.welcomePage },
          React.createElement(Glyphicon, { style: Styles.bigGlyph, glyph: 'user' }),
          React.createElement(
            'h1',
            null,
            'Connect a Door43 account'
          ),
          React.createElement(
            'p',
            { style: Styles.tutorialInfo },
            'Connecting your Door43 account lets you save your checks online, you can create an account if you dont already have one.'
          ),
          React.createElement(
            'div',
            { style: Styles.loginBox },
            React.createElement(Login, { success: () => {
                this.setState({ index: this.state.index + 1 });
              } })
          )
        );
        break;
      case 3:
        return React.createElement(
          'div',
          { style: Styles.welcomePage },
          React.createElement(Glyphicon, { style: Styles.bigGlyph, glyph: 'cloud-download' }),
          React.createElement(
            'h1',
            null,
            'Load your first project'
          ),
          React.createElement(
            'p',
            { style: Styles.tutorialInfo },
            'You can load in your first project from Door43 or from your hard drive.'
          ),
          React.createElement(
            'div',
            { style: { width: '50%', padding: '10px', borderRadius: '5px', backgroundColor: '#fff', margin: 'auto', maxHeight: '160px' } },
            React.createElement(Upload, {
              success: () => {
                this.setState({
                  index: this.state.index + 1,
                  tutorial: true
                });
              },
              styles: {
                color: '#1f273b',
                fontSize: '22px',
                padding: '20px'
              },
              isWelcome: true })
          )
        );
        break;
      case 4:
        break;
    }
  }

  getTutorialOverlay(e) {
    var _this = this;
    switch (e) {
      case 1:
        return React.createElement(
          Popover,
          {
            id: 'accountSettings',
            placement: 'right',
            positionLeft: 88,
            positionTop: 35,
            title: 'Changing Accounts' },
          React.createElement(
            'div',
            { style: Styles.tutorialPopover },
            React.createElement(
              'p',
              null,
              'Clicking here will allow you to log out or see more information about your account'
            )
          ),
          React.createElement(
            Button,
            {
              style: Styles.nextTutorialButton,
              onClick: () => {
                _this.setState({ tutorialIndex: this.state.tutorialIndex + 1 });
              },
              bsStyle: 'link' },
            'Next',
            ' ',
            React.createElement(Glyphicon, { glyph: 'chevron-right' })
          )
        );
        break;
      case 2:
        return React.createElement(
          Popover,
          {
            id: 'openProject',
            placement: 'right',
            positionLeft: 88,
            positionTop: 113,
            title: 'Opening an Existing Project' },
          React.createElement(
            'div',
            { style: Styles.tutorialPopover },
            React.createElement(
              'p',
              null,
              'You can also open an existing translationCore project and continue yours or someone elses work.'
            )
          ),
          React.createElement(
            Button,
            {
              style: Styles.nextTutorialButton,
              onClick: () => {
                _this.setState({ tutorialIndex: this.state.tutorialIndex + 1 });
              },
              bsStyle: 'link' },
            'Next',
            ' ',
            React.createElement(Glyphicon, { glyph: 'chevron-right' })
          )
        );
        break;
      case 3:
        return React.createElement(
          Popover,
          {
            id: 'syncProject',
            placement: 'right',
            positionLeft: 88,
            positionTop: 202,
            title: 'Sync Your Work To Door43' },
          React.createElement(
            'div',
            { style: Styles.tutorialPopover },
            React.createElement(
              'p',
              null,
              'Clicking here while connected to the internet will save a copy of what you are working on to Door43'
            )
          ),
          React.createElement(
            Button,
            {
              style: Styles.nextTutorialButton,
              onClick: () => {
                _this.setState({ tutorialIndex: this.state.tutorialIndex + 1 });
              },
              bsStyle: 'link' },
            'Next',
            ' ',
            React.createElement(Glyphicon, { glyph: 'chevron-right' })
          )
        );
        break;
      case 4:
        return React.createElement(
          Popover,
          {
            id: 'generateReport',
            placement: 'right',
            positionLeft: 88,
            positionTop: 293,
            title: 'Generating a Report' },
          React.createElement(
            'div',
            { style: Styles.tutorialPopover },
            React.createElement(
              'p',
              null,
              'This will generate a report for all of the checks performed by you or anyone else working on the project you have open.'
            )
          ),
          React.createElement(
            Button,
            {
              style: Styles.nextTutorialButton,
              onClick: () => {
                _this.setState({ tutorialIndex: this.state.tutorialIndex + 1 });
              },
              bsStyle: 'link' },
            'Next',
            ' ',
            React.createElement(Glyphicon, { glyph: 'chevron-right' })
          )
        );
        break;
      case 5:
        return React.createElement(
          Popover,
          {
            id: 'loadApp',
            placement: 'right',
            positionLeft: 88,
            positionTop: 379,
            title: 'Loading a Check' },
          React.createElement(
            'div',
            { style: Styles.tutorialPopover },
            React.createElement(
              'p',
              null,
              'This is where you load in an app so that you can perform a check on your draft.'
            )
          ),
          React.createElement(
            Button,
            {
              style: Styles.nextTutorialButton,
              onClick: () => {
                _this.setState({ tutorialIndex: this.state.tutorialIndex + 1 });
              },
              bsStyle: 'link' },
            'Next',
            ' ',
            React.createElement(Glyphicon, { glyph: 'chevron-right' })
          )
        );
        break;
      case 6:
        return React.createElement(
          Popover,
          {
            id: 'appSettings',
            placement: 'right',
            positionLeft: 88,
            positionTop: 465,
            title: 'Settings' },
          React.createElement(
            'div',
            { style: Styles.tutorialPopover },
            React.createElement(
              'p',
              null,
              'Here you can access various settings relating to how translationCore looks and functions'
            )
          ),
          React.createElement(
            Button,
            {
              style: Styles.nextTutorialButton,
              onClick: () => {
                this.props.initialize();
              },
              bsStyle: 'link' },
            'Done',
            ' ',
            React.createElement(Glyphicon, { glyph: 'chevron-right' })
          )
        );
        break;
    }
  }

  render() {
    var _this = this;
    if (this.state.tutorial) {
      return React.createElement(
        'div',
        { style: Styles.tutorialPage },
        React.createElement(SideNavBar, null),
        this.getTutorialOverlay(this.state.tutorialIndex),
        React.createElement(
          Button,
          {
            style: Styles.skipTutorialButton,
            onClick: this.props.initialize,
            bsStyle: 'link' },
          'Skip Tutorial',
          ' ',
          React.createElement(Glyphicon, { glyph: 'chevron-right' })
        )
      );
    } else {
      return React.createElement(
        'div',
        { style: Styles.welcomeFrame },
        React.createElement(
          Button,
          {
            bsStyle: 'link',
            onClick: () => {
              //If you are on the first slide you cant go backwards
              if (this.state.index == 1) {
                return;
              } else {
                _this.setState({ index: this.state.index - 1 });
              }
            },
            style: Styles.navButtons
          },
          React.createElement(Glyphicon, { glyph: 'chevron-left' })
        ),
        this.getPage(this.state.index),
        React.createElement(
          Button,
          {
            bsStyle: 'link',
            onClick: () => {
              if (this.state.index == NUM_OF_SLIDES) {
                _this.setState({ tutorial: true });
              } else {
                _this.setState({ index: this.state.index + 1 });
              }
            },
            style: Styles.navButtons
          },
          React.createElement(Glyphicon, { glyph: 'chevron-right' })
        )
      );
    }
  }
}

module.exports = Welcome;