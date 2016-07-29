/**
 * @author Luke Wilson & Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 * This version is specifically modified for the welcome process.
 ******************************************************************************/
const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Nav = require('react-bootstrap/lib/Nav.js');
const NavItem = require('react-bootstrap/lib/NavItem.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const Tab = require('react-bootstrap/lib/Tab.js');
const Tabs = require('react-bootstrap/lib/Tabs.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore');
const CheckDataGrabber = require('../create_project/CheckDataGrabber');
const OnlineInput = require('../OnlineInput');
const DragDrop = require('../DragDrop');
var api = window.ModuleApi;
const IMPORT_PROJECT = 'Import Translation Studio Project';
const IMPORT_LOCAL = 'Import Project Locally';
const IMPORT_ONLINE = 'Import From Online';
const path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');
const booksOfBible = require('../booksOfBible');

const WelcomeUpload = React.createClass({
  getInitialState: function() {
    return {active: 1,
       showFile: true,
       params: {
         originalLanguagePath: window.__base + "data/ulgb"
       },
       saveLocation:""
     };
  },
  handleSelect: function(eventKey) {
    this.setState({active: eventKey});
    if (eventKey === 1) {
      this.setState({showFile: true});
    } else {
      this.setState({showFile: false});
    }
  },

  setTargetLanguageFilePath: function(path, link, callback) {
    var tempParams = this.state.params;
    if (link) {
        tempParams.repo = link;
    }

    tempParams.targetLanguagePath = path;
    this.setState({
      saveLocation:path,
      params:tempParams
    }, callback(true));
  },

  sendFilePath: function(path, link) {
    var _this = this;
    if (!this.setTargetLanguageFilePath) {
      console.error("Can't find setTargetLanguageFilePath!");
    }
    else {
      this.setTargetLanguageFilePath(path, link, function(result){
        if (result) {
        _this.makeTCManifest(function(result) {
          if (result) {
            _this.props.success();
          }
        });
      }
      });
    }
  },

  makeTCManifest(callback){
    var _this = this;
    var manifestLocation = path.join(this.state.params.targetLanguagePath, 'manifest.json');
    fs.readJson(manifestLocation, function(err, parsedManifest){
      if (parsedManifest && parsedManifest.project && parsedManifest.project.name) {
            var bookTitle = parsedManifest.project.name.split(' ');
            var bookName = _this.getBookAbbr(parsedManifest.project.name);
            _this.setBookName(bookName);
            let bookFileName = bookTitle.join('') + '.json';
            var saveLocation = _this.state.params.targetLanguagePath;
            var user = CoreStore.getLoggedInUser();
            var projectData = {
              local: true,
              target_language: _this.state.params.targetLanguagePath,
              original_language: ('data/ulgb/'),
              gateway_language: '',
              user: [{username: '', email: ''}],
              checkLocations: [],
              saveLocation: saveLocation,
              repo: _this.state.params.repo
            }
            api.putDataInCommon('saveLocation', saveLocation);
            CheckDataGrabber.saveManifest(saveLocation, projectData, parsedManifest);
            callback(true);
          } else {
            dialog.showErrorBox(DEFAULT_ERROR, INVALID_PROJECT);
            callback(false);
          }
        });
  },

  setBookName: function(abbr) {
    var tempParams = this.state.params;
    tempParams.bookAbbr = abbr;
    this.setState({
      params:tempParams
    });
  },

  getBookAbbr: function(book) {
    for (var bookAbbr in booksOfBible) {
      if (book.toLowerCase() == booksOfBible[bookAbbr].toLowerCase() || book.toLowerCase() == bookAbbr) {
        return bookAbbr;
      }
    }
    return null;
  },

  render: function() {
    var mainContent;
    if (this.state.showFile === true) {
      mainContent = <DragDrop
                      sendFilePath={this.sendFilePath}
                    />;
    } else {
      mainContent = (<div>
                       <br />
                       <OnlineInput sendFilePath={this.sendFilePath}/>
                     </div>);
    }
    return (
          <div>
            <Modal.Body>
            <Tab.Container id={"loadOnline"} activeKey={this.state.active} onSelect={this.handleSelect} style={{backgroundColor: '#ffffff', borderRadius:'10px'}}>
              <Nav justified>
              <NavItem eventKey={1} className={"loaderButton"} style={{marginLeft: '5px'}}>{IMPORT_LOCAL}</NavItem>
              <NavItem eventKey={2} className={"loaderButton"} style={{marginLeft: '5px'}}>{IMPORT_ONLINE}</NavItem>
              </Nav>
            </Tab.Container>
            {mainContent}
            </Modal.Body>
          </div>
    );
  }
});

module.exports = WelcomeUpload;
