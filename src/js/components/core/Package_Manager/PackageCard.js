/**
 *@author: Manny Colon
 *@description: This component takes on props from PackageManagerView.js
 in order to display cards for each of the apps/packages found
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactDOM = require("react-dom");
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, FormGroup, FormControl} = RB;
const style = require("./Style");
const PackageManager = require('./PackageManager.js');

class PackageCard extends React.Component{
  constructor() {
    super();
    this.state = {
      installStatus: 'Install',
      removeStatus: 'Uninstall',
      updateStatus: 'Update',
    };
  }

  componentDidMount() {
    this.setState({installVersion: this.props.packVersion[this.props.packVersion.length - 1]});
    this.setState({installStatus: PackageManager.isInstalled(this.props.packName) ? 'Installed' : 'Install'});
  }

  install(name, version) {
    this.setState({installStatus: 'Installing...'});
    var _this = this;
    PackageManager.download(name, version, function(err, data){
      if(!err) {
        if(_this.isMounted()) {
          _this.setState({installStatus: 'Installed'});
        }
      }
    });
  }

  handleVersion(e) {
     this.setState({installVersion: e.target.value});
   }

  update(name, version) {
    console.log(version);
    var _this = this;
    this.setState({updateStatus: 'Updating'})
    PackageManager.update(name, version, function(err){
      if (!err) {
        if(_this.isMounted()) {
          _this.setState({updateStatus: 'Updated'})
        }
      }
    });
  }

  uninstall(name) {
    this.setState({removeStatus: 'Uninstalling...'});
    PackageManager.uninstall(name);
    this.setState({removeStatus: 'Uninstalled'});
  }

  render(){
    let buttons = [];
    var optionArray = [];
    var versionDisplay = <span style={style.versionText}>{" " + this.props.packVersion}</span>
    if(this.props.buttonDisplay === "updatePack"){
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="success"
                disabled={this.state.updateStatus !== 'Update'}
                title={"Update " + this.props.packName} onClick={this.update.bind(this, this.props.packName, this.state.newPackVersion)}>
                <Glyphicon glyph="cloud-download" /> {this.state.updateStatus+" to " + this.props.newPackVersion}
        </Button>);
    }else if (this.props.buttonDisplay === "downloadPack") {
      for (var versions in this.props.packVersion) {
        var versionNumber = this.props.packVersion[versions];
        optionArray.unshift(<option key={versions} value={versionNumber}>{versionNumber}</option>)
      }
      versionDisplay = (<FormGroup className="pull-right" controlId="formControlsSelect" style={{width: "100px", marginRight: "10px"}}>
                          <FormControl onChange={this.handleVersion.bind(this)} componentClass="select" placeholder="select"  disabled={this.state.installStatus !== 'Install'}>
                            {optionArray}
                          </FormControl>
                        </FormGroup>);
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="primary"
                style={style.packCardButton} title={"Install " + this.props.packName}
                onClick={this.install.bind(this, this.props.packName, this.state.installVersion)} disabled={this.state.installStatus !== 'Install'}>
                <Glyphicon glyph="cloud-download" /> {this.state.installStatus}
        </Button>);
    }else if (this.props.buttonDisplay === "installedPack") {
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="danger"
                title={"Uninstall " + this.props.packName} disabled={this.state.removeStatus !== 'Uninstall'}
                onClick={this.uninstall.bind(this, this.props.packName)}>
                <Glyphicon glyph="trash" /> {this.state.removeStatus}
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
