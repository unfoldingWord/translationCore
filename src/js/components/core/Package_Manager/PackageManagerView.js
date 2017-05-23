/**
 *@author: Manny Colon
 *@description: This component handles the view for The apps/plugins/modules
 package manager.
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const SideBarButton = require("./SideBarButton");

const RB = api.ReactBootstrap;
const {Glyphicon, FormControl} = RB;
const Style = require("./Style");
const PackageCard = require("./PackageCard");
const PackManagerSideBar = require("./PackManagerSideBar");
const PackageManager = require('./PackageManager.js');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

var mounted = false;

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
    mounted = true;
    api.registerEventListener('PackManagerVisibility', this.handlePackManagerVisibility);
  }

  componentWillUnmount() {
    mounted = false;
    api.removeEventListener('PackManagerVisibility', this.handlePackManagerVisibility);
  }


  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
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
    this.setState({displayStatus: displayStatusState});
  }

  hidePackManager(){
    this.setState({visiblePackManager: false});
  }

  updateHover(key, value) {
    let tempObj = {};
    tempObj[key] = value;
    this.setState(tempObj);
  }

  cardStates(key, value) {
    let tempObj = {};
    if (!tempObj[key]) {
      tempObj[key] = {};
    }
    for (var i in value) {
      tempObj[key][i] = value[i];
    }
    this.setState(tempObj);
  }

  install(name, version) {
    this.cardStates(name, {installStatus: 'Installing...'})
    var _this = this;
    PackageManager.download(name, version, function(err, data){
      if(!err) {
        if(mounted) {
          _this.cardStates(name, {installStatus: 'Installed'})
        }
      }
    });
  }

  uninstall(name) {
    this.cardStates(name, {removeStatus: 'Uninstalling...'})
    PackageManager.uninstall(name);
    this.cardStates(name, {removeStatus: 'Uninstalled'})
  }

  update(name, version) {
    this.cardStates(name, {updateStatus: 'Updating...'})
    var _this = this;
    PackageManager.update(name, version, function(err){
      if (!err) {
        if(mounted) {
          _this.cardStates(name, {updateStatus: 'Updated'})
        }
      }
    });
  }

  handleVersion(name, e) {
    this.cardStates(name, {selectedVersion: e.target.version})
   }

  generateCards() {
    if (!this.state.data) {
      this.fetchData();
    }
    var cards = <div></div>
    if (this.state.displayStatus === 'downloadPack') {
      var data = this.state.data;
        cards = [<div key={'default'}></div>];
        for (var i in data) {
          var currentPackage = data[i];
          var uniqueState = this.state[i] || {};
          if (!uniqueState.installStatus) {
            uniqueState.installStatus = PackageManager.isInstalled(i) ? 'Installed' : 'Install'
          }
          if (currentPackage.main === 'true' && ~i.toLowerCase().indexOf(this.state.searchText.toLowerCase())) {
            cards.push(<PackageCard key={i} packName={i} packVersion={currentPackage.versions || [currentPackage.latestVersion]} numOfDownloads={""}
            description={currentPackage.description || "No description found."}
            install={this.install.bind(this, i, uniqueState.selectedVersion || currentPackage.latestVersion)}
            handleVersion={this.handleVersion.bind(this, i)}
            iconPathName={currentPackage.icon}
            installStatus={uniqueState.installStatus}
            buttonDisplay={'downloadPack'} newPackVersion={"0.3.0"}/>);
          }
        }
        return cards;
    } else if(this.state.displayStatus === 'installedPack') {
        var installed = PackageManager.getLocalList();
        cards = [<div key={'default'}></div>];
        var data = this.state.data;
        for (var i = 0; i < installed.length; i++) {
          var currentPackage = installed[i];
          var manifestLocation = pathex.join(PACKAGE_COMPILE_LOCATION, currentPackage, 'package.json');
          try {
            var manifest = require(manifestLocation);
          } catch(err) {
            var manifest = {};
          }
          var uniqueState = this.state[currentPackage] || {};
          if (!uniqueState.removeStatus) {
            uniqueState.removeStatus = 'Uninstall';
          }
          if (~currentPackage.toLowerCase().indexOf(this.state.searchText.toLowerCase()) && data[installed[i]] && data[installed[i]].main === 'true') {
            cards.push(<PackageCard key={currentPackage} packName={currentPackage} packVersion={manifest.version || ''} numOfDownloads={""}
            description={manifest.description || "No description found."}
            uninstall={this.uninstall.bind(this, currentPackage)}
            removeStatus={uniqueState.removeStatus}
            iconPathName={pathex.join(PACKAGE_COMPILE_LOCATION, currentPackage, 'icon.png')}
            buttonDisplay={'installedPack'} newPackVersion={"0.3.0"}/>);
          }
        }
        return cards;
    } else if (this.state.displayStatus === 'updatePack') {
      var data = this.state.data;
      var installed = PackageManager.getLocalList();
      cards = [<div key={'default'}></div>];
      for (var i = 0; i < installed.length; i++) {
        var currentPackage = installed[i];
        var uniqueState = this.state[currentPackage] || {};
        if (!uniqueState.updateStatus) {
          uniqueState.updateStatus = 'Update';
        }
        var manifestLocation = pathex.join(PACKAGE_COMPILE_LOCATION, currentPackage, 'package.json');
        try {
          var manifest = require(manifestLocation);
        } catch(err) {
          var manifest = {};
        }
        var remotePackage = data[currentPackage];
        if (remotePackage) {
          var remoteVersion = remotePackage.latestVersion;
        } else {
          remoteVersion = '1.0.0';
          console.warn('Could not find remote version of package ' + currentPackage);
        }
        var localVersion = PackageManager.getVersion(currentPackage);
        if (remoteVersion > localVersion && ~installed[i].toLowerCase().indexOf(this.state.searchText.toLowerCase())) {
          cards.push(<PackageCard key={i} packName={installed[i]} packVersion={localVersion || ''} numOfDownloads={""}
          description={manifest.description || "No description found."}
          updateStatus={uniqueState.updateStatus}
          update={this.update.bind(this, installed[i], remoteVersion)}
          iconPathName={pathex.join(PACKAGE_COMPILE_LOCATION, currentPackage, 'icon.png')}
          buttonDisplay={'updatePack'} newPackVersion={remoteVersion}/>);
        }
      }
      return cards;
    }
  }

  render(){
    if(!this.state.visiblePackManager){
      return (<div></div>);
    }
    var cards = this.generateCards();
      return(
        <div style={Style.layout}>
          <PackManagerSideBar style={Style} hidePackManager={this.hidePackManager.bind(this)}>
            <SideBarButton value={" Packages"} title={"Access your Packages"}
                            imageName={"images/greyPackage.svg"} hoverImage={"images/Package.svg"}
                            updateHover={this.updateHover.bind(this, 'installedHover')} hover={this.state.installedHover}
                            handleButtonClick={this.handleDisplayStatus.bind(this, 'installedPack')}  />
            <SideBarButton glyphicon={"plus"} value={" Install"} title={"Install/Download New Packages"}
                          updateHover={this.updateHover.bind(this, 'installHover')} hover={this.state.installHover}
                          handleButtonClick={this.handleDisplayStatus.bind(this, 'downloadPack')} />
            <SideBarButton glyphicon={"cloud-download"} value={" Updates"} title={"Update your Packages"}
                          updateHover={this.updateHover.bind(this, 'updatesHover')} hover={this.state.updatesHover}
                          handleButtonClick={this.handleDisplayStatus.bind(this, 'updatePack')} />
          </PackManagerSideBar>
          <div style={Style.header}>
            <FormControl
                type="text"
                placeholder="Search Packages by Name"
                onChange={this.handleChange.bind(this)}
                style={{backgroundColor: "var(--background-color-dark", border: "1px solid var(--background-color)", width: "66%"}}
            />
          </div>
          <Glyphicon glyph="remove" title="Close Package Manager" style={Style.removeGlypcIcon}
              onClick={this.hidePackManager.bind(this)}/>
              {cards}
        </div>
      );
  }

}
module.exports = PackageManagerView;
