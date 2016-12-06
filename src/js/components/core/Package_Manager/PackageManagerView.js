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
      cards: [<div key={"default"}></div>],
      searchText: '',
      data: null
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

  componentDidMount() {
    var _this = this;
    PackageManager.list(function(data) {
      _this.setState({data: data});
    });
  }

  handleChange(e) {
    var searchText = e.target.value;
    this.setState({searchText: searchText});
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
    if(!this.state.visiblePackManager || !this.state.data){
      return (<div></div>);
    }else{
      var cards = <div></div>
      if (this.state.displayStatus === 'downloadPack') {
        var data = this.state.data;
          cards = [<div key={'default'}></div>];
          for (var i in data) {
            var currentPackage = data[i];
            if (currentPackage.main === 'true' && ~i.toLowerCase().indexOf(this.state.searchText.toLowerCase())) {
              cards.push(<PackageCard key={i} packName={i} packVersion={currentPackage.version} numOfDownloads={""}
              description={currentPackage.description || "No description found."}
              iconPathName={currentPackage.icon}
              buttonDisplay={'downloadPack'} newPackVersion={"0.3.0"}/>);
            }
          }
          this.state.cards = cards;
          this.cards = this.state.cards;
      } else if(this.state.displayStatus === 'installedPack') {
          var installed = PackageManager.getLocalList();
          cards = [<div key={'default'}></div>];
          var data = this.state.data;
          for (var i = 0; i < installed.length; i++) {
            var currentPackage = installed[i];
            var manifestLocation = pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'package.json');
            try {
              var manifest = require(manifestLocation);
            } catch(err) {
              var manifest = {};
            }
            if (~currentPackage.toLowerCase().indexOf(this.state.searchText.toLowerCase()) && data[installed[i]] && data[installed[i]].main === 'true') {
              cards.push(<PackageCard key={i} packName={currentPackage} packVersion={manifest.version || ''} numOfDownloads={""}
              description={manifest.description || "No description found."}
              iconPathName={pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'icon.png')}
              buttonDisplay={'installedPack'} newPackVersion={"0.3.0"}/>);
            }
          }
          this.cards = cards;
      } else if (this.state.displayStatus === 'updatePack') {
        var data = this.state.data;
        var installed = PackageManager.getLocalList();
        cards = [<div key={'default'}></div>];
        for (var i = 0; i < installed.length; i++) {
          var currentPackage = installed[i];
          var manifestLocation = pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'package.json');
          try {
            var manifest = require(manifestLocation);
          } catch(err) {
            var manifest = {};
          }
          var remotePackage = data[currentPackage];
          if (remotePackage) {
            var remoteVersion = remotePackage.version;
          } else {
            remoteVersion = '1.0.0';
            console.warn('Could not find remote version of package ' + currentPackage);
          }
          var localVersion = PackageManager.getVersion(currentPackage);
          if (remoteVersion > localVersion && ~installed[i].toLowerCase().indexOf(this.state.searchText.toLowerCase())) {
            cards.push(<PackageCard key={i} packName={installed[i]} packVersion={localVersion || ''} numOfDownloads={""}
            description={manifest.description || "No description found."}
            iconPathName={pathex.join(PACKAGE_SAVE_LOCATION, currentPackage, 'icon.png')}
            buttonDisplay={'updatePack'} newPackVersion={remoteVersion}/>);
            }
          }
          this.state.cards = cards;
          this.cards = this.state.cards;
      }
      return(
        <div style={Style.layout}>
          <PackManagerSideBar hidePackManager={this.hidePackManager.bind(this)}/>
          <div style={Style.header}>
            <FormControl
                type="text"
                placeholder="Search Packages by Name"
                onChange={this.handleChange.bind(this)}
                style={{backgroundColor: "#303337", border: "1px solid rgba(0, 0, 0, 0.5)", width: "66%"}}
            />
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
