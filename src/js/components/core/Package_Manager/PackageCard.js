/**
 *@author: Manny Colon
 *@description: This component takes on props from PackageManagerView.js
 in order to display cards for each of the apps/packages found
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, FormGroup, FormControl} = RB;
const style = require("./Style");

var mounted = false;
class PackageCard extends React.Component{
  constructor() {
    super();
  }

  componentDidMount() {
    mounted = true;
    this.props.manageState({installVersion: this.props.packVersion[this.props.packVersion.length - 1]});
    this.props.manageState({installStatus: this.props.PackageManager.isInstalled(this.props.packName) ? 'Installed' : 'Install'});
  }

  componentWillUnmount() {
    mounted = false;
  }

  install(name, version) {
    this.props.manageState({installStatus: 'Installing...'});
    var _this = this;
    this.props.PackageManager.download(name, version, function(err, data){
      if(!err) {
        if(mounted) {
          _this.props.manageState({installStatus: 'Installed'});
        }
      }
    });
  }

  handleVersion(e) {
     this.props.manageState({installVersion: e.target.value});
   }

  update(name, version) {
    var _this = this;
    this.props.manageState({updateStatus: 'Updating'})
    this.props.PackageManager.update(name, version, function(err){
      if (!err) {
        if(mounted) {
          _this.props.manageState({updateStatus: 'Updated'})
        }
      }
    });
  }

  uninstall(name) {
    this.props.manageState({removeStatus: 'Uninstalling...'});
    this.props.PackageManager.uninstall(name);
    this.props.manageState({removeStatus: 'Uninstalled'});
  }

  render() {
    var localStates = this.props.states;
    if (!localStates) {
      localStates = {}
    }
    if (!localStates.installStatus) {
      localStates.installStatus = 'Install';
    }
    if (!localStates.removeStatus) {
      localStates.removeStatus = 'Uninstall';
    }
    if (!localStates.updateStatus) {
      localStates.updateStatus = 'Update';
    }
    let buttons = [];
    var optionArray = [];
    var versionDisplay = <span style={style.versionText}>{" " + this.props.packVersion}</span>
    if(this.props.buttonDisplay === "updatePack"){
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="success"
                disabled={localStates.updateStatus !== 'Update'}
                title={"Update " + this.props.packName} onClick={this.update.bind(this, this.props.packName, localStates.newPackVersion)}>
                <Glyphicon glyph="cloud-download" /> {localStates.updateStatus+" to " + this.props.newPackVersion}
        </Button>);
    }else if (this.props.buttonDisplay === "downloadPack") {
      for (var versions in this.props.packVersion) {
        var versionNumber = this.props.packVersion[versions];
        optionArray.unshift(<option key={versions} value={versionNumber}>{versionNumber}</option>)
      }
      versionDisplay = (<FormGroup className="pull-right" controlId="formControlsSelect" style={{width: "100px", marginRight: "10px"}}>
                          <FormControl onChange={this.handleVersion.bind(this)} componentClass="select" placeholder="select"  disabled={localStates.installStatus !== 'Install'}>
                            {optionArray}
                          </FormControl>
                        </FormGroup>);
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="primary"
                style={style.packCardButton} title={"Install " + this.props.packName}
                onClick={this.install.bind(this, this.props.packName, localStates.installVersion)} disabled={localStates.installStatus !== 'Install'}>
                <Glyphicon glyph="cloud-download" /> {localStates.installStatus}
        </Button>);
    }else if (this.props.buttonDisplay === "installedPack") {
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="danger"
                title={"Uninstall " + this.props.packName} disabled={localStates.removeStatus !== 'Uninstall'}
                onClick={this.uninstall.bind(this, this.props.packName)}>
                <Glyphicon glyph="trash" /> {localStates.removeStatus}
        </Button>);
    }
    return(
        <div style={style.cardLayout}>
          <div className="pull-right" style={style.cardBody} title="Number of Downloads">
            <Glyphicon glyph="cloud-download" style={{color: "#555555"}}/>{" " + this.props.numOfDownloads}
          </div>
          <h4 style={{marginTop: "0px"}}>
            {this.props.packName}
            {versionDisplay}
          </h4>
          <span style={style.cardBody}>{this.props.description}</span>
          <div style={{marginTop: "10px"}}>
            <div className="pull-right">
              {buttons}
            </div>
            <img style={style.packIcon} src={this.props.iconPathName} />
          </div>

        </div>
    );
  }
}
module.exports = PackageCard;
