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
const ManifestGenerator = require('./create_project/ProjectManifest.js');
const CheckStore = require('../../stores/CheckStore');
const api = window.ModuleApi;

const IMPORT_PROJECT = 'Import Translation Studio Project';
const IMPORT_LOCAL = 'Import Project Locally';
const IMPORT_ONLINE = 'Import From Online';

const UploadModal = React.createClass({
  getInitialState: function() {
    return {active: 1, showFile: false, link:""};
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

  getLink() {
    return this.refs.Online.state.value;
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
      var manifest = ManifestGenerator(data, tsManifest);
      api.putDataInCommon('tcManifest', manifest);

      fs.outputJson(manifestLocation, manifest, function(err) {
        if (err) {
            const alert = {
            title: 'Error Saving Manifest',
            content: err.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
          console.error(err);
        }
      });
    }
    catch(err) {
      console.error(err);
      const alert = {
            title: 'Error Saving Translation Studio Manifest',
            content: err.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
    }
  },

  /**
   * @description - grabs the translationCore manifest from the folder and returns it
   * @param {string} folderpath - Path to the folder where the translationStudio is located
   */
  getManifest: function(folderPath, callback) {
    fs.readJson(Path.join(folderPath, 'tc-manifest.json'), function(err) {
      if (err) {
        const alert = {
            title: 'Error Getting Transaltion Studio Manifest',
            content: err.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
          console.log(err);
      }
    });
  },

  /**
   * @desription - This generates the default params from the path and saves it in the CheckStore
   * @param {string} path - The path to the folder containing the translationStudio project
   * @param {object} translationStudioManifest - The parsed json object of the translationStudio
   * manifest
   */
  getParams: function(path, translationStudioManifest) {
    var params = {
      'originalLanguagePath': Path.join(window.__base, 'data', 'tagged')
    }
    params.targetLanguagePath = path;
    params.bookAbbr = translationStudioManifest.project.id;
    //not actually used right now because we're hard coded for english
    params.gatewayLanguage = translationStudioManifest.source_translations.language_id;
    params.direction = translationStudioManifest.target_language.direction;

    return params;
  },

  clearPreviousData: function() {
    CheckStore.WIPE_ALL_DATA();
    api.modules = {};
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
  sendFilePath: function(path, link, callback) {
    var _this = this;
    this.clearPreviousData();
    if (path) {
      this.loadTranslationStudioManifest(path,
        function(err, translationStudioManifest) {
          if (err) {
            const alert = {
            title: 'Error Getting Transaltion Studio Manifest',
            content: err.message,
            leftButtonText: 'Ok'
          }
          api.createAlert(alert);
            console.error(err);
          }
          else {
            try {
              api.putDataInCommon('saveLocation', path);
              api.putDataInCommon('params', _this.getParams(path, translationStudioManifest));
            }
            catch(error) {
              console.error(error);
            }

            if (!_this.translationCoreManifestPresent(path)) {
              _this.saveManifest(path, {user: [CoreStore.getLoggedInUser()],
                repo: link || null}, translationStudioManifest);
            }
            else {
              _this.getManifest(path, function(error, tcManifest) {
                if (error) {
                  console.error(error);
                  const alert = {
                    title: 'Error Getting Transaltion Studio Manifest',
                    content: error.message,
                    leftButtonText: 'Ok'
                  }
                  api.createAlert(alert);
                }
                else {
                  api.putDataInCommon('tcManifest', tcManifest);
                }
              });
              Access.loadFromFilePath(path, callback);
            }

            if (_this.props.success) {
              _this.props.success();
            }
          }
        }
      );
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
      mainContent = <DragDrop
                     styles={this.props.styles}
                     sendFilePath={this.sendFilePath}
                     isWelcome={this.props.isWelcome}
                     />;
    }
    else {
      mainContent = (
        <div>
          <br />
          <OnlineInput ref={"Online"} sendFilePath={this.sendFilePath}/>
        </div>
      );
    }
    if (this.props.show !== false) {
      return (
        <div>
          <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.handleSelect}>
            <NavItem eventKey={1}>{IMPORT_ONLINE}</NavItem>
            <NavItem eventKey={2}>{IMPORT_LOCAL}</NavItem>
          </Nav>
            {mainContent}
        </div>
      );
    } else {
      return (<div> </div>)
    }
  }
});

module.exports = UploadModal;
