/**
 *@author: Manny Colon
 *@description: This component handles the view for The apps/plugins/modules
 package manager.
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactDOM = require("react-dom");
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup, Button} = RB;
const Style = require("./Style");
const PackageCard = require("./PackageCard");
const PackManagerSideBar = require("./PackManagerSideBar");
const PackageManager = require('./PackageManager.js');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_SAVE_LOCATION = pathex.join(PARENT, 'packages');
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

class PackageManagerView extends React.Component{
  constructor() {
    super();
    this.state = {
      visiblePackManager: true,
      displayStatus: "downloadPack",
      cards: [<div key={"default"}></div>]
    };
    this.handlePackManagerVisibility = this.handlePackManagerVisibility.bind(this);
    this.handleDisplayStatus = this.handleDisplayStatus.bind(this);
  }

  componentWillMount(){
    api.registerEventListener('PackManagerVisibility', this.handlePackManagerVisibility);
    api.registerEventListener('cardDisplayStatus', this.handleDisplayStatus);
  }

  componentWillUnmount() {
    api.removeEventListener('PackManagerVisibility', this.handlePackManagerVisibility);
    api.removeEventListener('cardDisplayStatus', this.handleDisplayStatus);
  }

  handlePackManagerVisibility(param){
    this.setState(param);
  }

  handleDisplayStatus(displayStatusState){
    this.setState(displayStatusState);
  }

  hidePackManager(){
    this.setState({visiblePackManager: false});
  }

  render(){
    if(!this.state.visiblePackManager){
      return (<div></div>);
    }else{
      var cards = <div></div>
      var _this = this;
      if (this.state.displayStatus === 'downloadPack') {
        PackageManager.list(function(data) {
          cards = [<div key={'default'}></div>];
          for (var i in data) {
            var currentPackage = data[i];
            if (currentPackage.main === 'true') {
              cards.push(<PackageCard key={i} packName={i} packVersion={currentPackage.version} numOfDownloads={"30"}
              description={currentPackage.description || "No description found."}
              iconPathName={currentPackage.icon}
              buttonDisplay={'downloadPack'} newPackVersion={"0.3.0"}/>);
            }
          }
          _this.setState({cards: cards});
          _this.cards = _this.state.cards;
        });
      } else if(this.state.displayStatus === 'installedPack') {
          var installed = PackageManager.getLocalList();
          cards = [<div key={'default'}></div>];
          for (var i = 0; i < installed.length; i++) {
            var currentPackage = installed[i];
            var manifestLocation = pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'manifest.json');
            var otherManifest = pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'manifest-hidden.json');
            try {
              var manifest = require(manifestLocation);
            } catch(err) {
              try {
                var manifest = require(otherManifest);
              } catch(e) {
                var manifest = {};
              }
            }
            cards.push(<PackageCard key={i} packName={currentPackage} packVersion={manifest.version || ''} numOfDownloads={"30"}
            description={manifest.description || "No description found."}
            iconPathName={pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'icon.png')}
            buttonDisplay={'installedPack'} newPackVersion={"0.3.0"}/>);
          }
          this.cards = cards;
      } else if (this.state.displayStatus === 'updatePack') {
        PackageManager.list(function(data) {
          var installed = PackageManager.getLocalList();
          cards = [<div key={'default'}></div>];
          for (var i = 0; i < installed.length; i++) {
            var currentPackage = installed[i];
            var manifestLocation = pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'manifest.json');
            var otherManifest = pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'manifest-hidden.json');
            try {
              var manifest = require(manifestLocation);
            } catch(err) {
              try {
                var manifest = require(otherManifest);
              } catch(e) {
                var manifest = {};
              }
            }
            var remotePackage = data[currentPackage];
            var remoteVersion = remotePackage.version;
            var localVersion = PackageManager.getVersion(installed[i]);
            if (remoteVersion > localVersion) {
              cards.push(<PackageCard key={i} packName={installed[i]} packVersion={localVersion || ''} numOfDownloads={"30"}
              description={manifest.description || "No description found."}
              iconPathName={pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'icon.png')}
              buttonDisplay={'updatePack'} newPackVersion={remoteVersion}/>);
            }
          }
          _this.setState({cards: cards});
          _this.cards = _this.state.cards;
        });
      }
      return(
        <div style={Style.layout}>
          <PackManagerSideBar hidePackManager={this.hidePackManager.bind(this)}/>
          <div style={Style.header}>

          </div>
          <Glyphicon glyph="remove" title="Close Package Manager" style={Style.removeGlypcIcon}
              onClick={this.hidePackManager.bind(this)}/>
              {this.cards}
        </div>
      );
    }
  }

}
module.exports = ReactDOM.render(<PackageManagerView />, document.getElementById('package_manager'));
