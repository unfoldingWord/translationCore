/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Nav = require('react-bootstrap/lib/Nav.js');
const NavItem = require('react-bootstrap/lib/NavItem.js');

const OnlineInput = require('./OnlineInput');
const DragDrop = require('./DragDrop');
const CoreStore = require('../stores/CoreStore');

const IMPORT_PROJECT = 'Import Translation Studio Project';
const IMPORT_LOCAL = 'Import Project Locally';
const IMPORT_ONLINE = 'Import From Online';

const UploadModal = React.createClass({
  getInitialState: function() {
    return {active: 1, showFile: false};
  },

  /** 
   * @description - This toggles our view to change from importing from online to importing 
   * from disk
   * @param {integer} eventKey - The 'key' that the tabs send their 'onSelect' event listener
   */
  handleSelect: function(eventKey) {
    this.setState({active: eventKey});
    if (eventKey === 1) {
      this.setState({showFile: false});
    } else {
      this.setState({showFile: true});
    }
  },

  // *
  //  * @description - Sets the targetLanguageFilePath within this context
  //  * @param {string} path - the folderpath to the translationStudio project folder, which should
  //  * contain the translationStudio manifest
  //  * @param {string} link - the URL pointing to the location of a translationStudio project located on
  //  * the GOGS server
  //  * @param {function} callback - A callback that will be called with 'true' after 'this' component's state
  //  * has been set
   
  // setTargetLanguageFilePath: function(path, link, callback) {

  // },

  /**
   * @description - Generates and saves a translationCore manifest file
   * @param {string} saveLocation - Filepath of where the translationCore manifest file will 
   * be saved. This is an ABSOLUTE PATH
   * @param {object} data - The translationCore manifest data to be saved
   * @param {object} tsManifest - The translationStudio manifest data loaded from a translation
   * studio project
   */
  saveManifest: function(saveLocation, data, tsManifest) {
    try {
      var manifestLocation = path.join(saveLocation, 'tc-manifest.json');
      var manifest = ManifestGenerator(data, tsManifest);
      api.putDataInCommon('tcManifest', manifest);

      fs.outputJson(manifestLocation, manifest, function(err) {
        if (err) {
          console.error(err);
        }
      });
    }
    catch(e) {
      console.error(e);
    }
  },

  /**
   * @description - Sets the target language filepath and/or link, while also generatering a TC 
   * manifest file and saving the params and saveLocation under the 'common' namespace in the
   * CheckStore
   * @param {string} path - The folder path that points to the directory that the translationStudio
   * project lives, which should include a manifest file
   * @param {string} link - URL that points to the location of a translationStudio project located on
   * the GOGS server
   */
  sendFilePath: function(path, link) {
    var _this = this;
    if (path) {
      if (!this.translationCoreManifestPresent(path)) {
        this.loadTranslationStudioManifest(path,
          function(err, translationStudioManifest) {
            _this.saveManifest(
              path, 
              {user: [CoreStore.getLoggedInUser()], 
                repo: link || 'none'},
              translationStudioManifest
            );
          });
        );
      }
    }
  },

  /**
   * @description - Loads in a translationStudio manifest
   */
  loadTranslationStudioManifest: function(path, callback) {
    var manifestLocation = path.join(path, 'manifest.json');
    fs.readJson(manifestLocation, callback);
  }

  /**
   * @description - This checks to see if a valid translationCore manifest file is present. 
   * @param {string} path - absolute path to a translationStudio project folder
   */
  translationCoreManifestPresent: function(path) {
    //this currently just uses 'require' and if it throws an error it will return false
    try {
      require(path.join(path, 'tc-manifest.json'));
      return true;
    }
    catch(e) {
      if (e.code != 'MODULE_NOT_FOUND') {
        console.error(e);
      }
    }
    return false;
  }

  /**
   * @description - Renders the upload modal
   */
  render: function() {
    var mainContent;
    if (this.state.showFile === true) {
      mainContent = <DragDrop sendFilePath={this.sendFilePath} />;
    } 
    else {
      mainContent = (
        <div>
          <br />
          <OnlineInput sendFilePath={this.sendFilePath}/>
        </div>  
      );
    }
    return (
      <div>        
        <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.handleSelect}>
          <NavItem eventKey={1}>{IMPORT_ONLINE}</NavItem>
          <NavItem eventKey={2}>{IMPORT_LOCAL}</NavItem>
        </Nav>
          {mainContent}
      </div>
    );
  }
});

module.exports = UploadModal;
