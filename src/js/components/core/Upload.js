/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');
const Path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');

const Button = require('react-bootstrap/lib/Button.js');
const Nav = require('react-bootstrap/lib/Nav.js');
const NavItem = require('react-bootstrap/lib/NavItem.js');

const OnlineInput = require('./OnlineInput');
const DragDrop = require('./DragDrop');
const CoreStore = require('../../stores/CoreStore');
const Access = require('./AccessProject');
const ManifestGenerator = require('./ProjectManifest');
const api = window.ModuleApi;

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
      var manifestLocation = Path.join(saveLocation, 'tc-manifest.json');
      console.log('ManifestLocation: ' + manifestLocation);
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
   * @desription - This generates the default params from the path and saves it in the CheckStore
   * @param {string} path - The path to the folder containing the translationStudio project
   * @param {object} translationStudioManifest - The parsed json object of the translationStudio
   * manifest
   */
  getParams: function(path, translationStudioManifest) {
    console.log('TranslationStudioManifest');
    console.dir(translationStudioManifest);
    var params = {
      'originalLanguagePath': Path.join(window.__base, 'data', 'ulgb')
    }
    params.targetLanguagePath = path;
    params.bookAbbr = translationStudioManifest.project.id;
    //not actually used right now because we're hard coded for english
    params.gatewayLanguage = translationStudioManifest.source_translations.language_id;

    return params;
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
      //check to see if there is a tcManifest in this folder. If there isn't, this also assumes
      // there is no checkdata
      if (!this.translationCoreManifestPresent(path)) {
        this.loadTranslationStudioManifest(path,
          function(err, translationStudioManifest) {
            if (err) {
              console.error(err);
            }
            else {
              _this.saveManifest(
                path, 
                {user: [CoreStore.getLoggedInUser()], 
                  repo: link || 'none'},
                translationStudioManifest
              );
              try {
                console.log('Putting the parameters in the checkstore');
                api.putDataInCommon('saveLocation', path);
                api.putDataInCommon('params', _this.getParams(path, translationStudioManifest));
              }
              catch(error) {
                console.error('Unable to generate parameters: ' + error);
              }
            }
          }
        );
      }
      else {
        Access.loadFromFilePath(path);
      }
    }
    if (this.props.success) {
      this.props.success();
    }
  },

  /**
   * @description - Loads in a translationStudio manifest
   */
  loadTranslationStudioManifest: function(path, callback) {
    var manifestLocation = Path.join(path, 'manifest.json');
    fs.readJson(manifestLocation, callback);
  },

  /**
   * @description - This checks to see if a valid translationCore manifest file is present. 
   * @param {string} path - absolute path to a translationStudio project folder
   */
  translationCoreManifestPresent: function(path) {
    //this currently just uses 'require' and if it throws an error it will return false
    try {
      require(Path.join(path, 'tc-manifest.json'));
      return true;
    }
    catch(e) {
      if (e.code != 'MODULE_NOT_FOUND') {
        console.error(e);
      }
    }
    return false;
  },

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
