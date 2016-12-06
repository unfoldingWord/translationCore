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
const {Glyphicon, Button} = RB;
const style = require("./Style");
const PackageManager = require('./PackageManager.js');

class PackageCard extends React.Component{
  constructor() {
    super();
    this.state = {
      installStatus: 'Install',
      removeStatus: 'Uninstall',
      updateStatus: 'Update'
    };
  }

  componentDidMount() {
    this.setState({installStatus: PackageManager.isInstalled(this.props.packName) ? 'Installed' : 'Install'});
  }

  install(name) {
    this.setState({installStatus: 'Installing...'});
    var _this = this;
    PackageManager.download(name, function(err, data){
      if(!err) {
        _this.setState({installStatus: 'Installed'});
      }
      console.log(name + ' ' + data);
    });
  }

  uninstall(name) {
    this.setState({installStatus: 'Install'});
    PackageManager.uninstall(name);
  }

  update(name) {
    var _this = this;
    this.setState({updateStatus: 'Updating'})
    PackageManager.update(name, function(err){
      if (!err) {
        _this.setState({updateStatus: 'Updated'})
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
    if(this.props.buttonDisplay === "updatePack"){
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="success"
                disabled={this.state.updateStatus !== 'Update'}
                title={"Update " + this.props.packName} onClick={this.update.bind(this, this.props.packName)}>
                <Glyphicon glyph="cloud-download" /> {this.state.updateStatus+" to " + this.props.newPackVersion}
        </Button>);
    }else if (this.props.buttonDisplay === "downloadPack") {
      buttons.push(
        <Button key={this.props.buttonDisplay} bsStyle="primary"
                style={style.packCardButton} title={"Install " + this.props.packName}
                onClick={this.install.bind(this, this.props.packName)} disabled={this.state.installStatus !== 'Install'}>
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
            <span style={style.versionText}>{" " + this.props.packVersion}</span>
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
