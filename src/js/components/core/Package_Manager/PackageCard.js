/**
 *@author: Manny Colon
 *@description: This component takes on props from PackageManagerView.js
 in order to display cards for each of the apps/packages found
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, FormGroup, FormControl} = RB;
const style = require("./Style");

var mounted = false;
class PackageCard extends React.Component{
  constructor() {
    super();
  }

  render() {
    let buttons = [];
    var optionArray = [];
    var versionDisplay = <span style={style.versionText}>{" " + this.props.packVersion}</span>
    if(this.props.buttonDisplay === "updatePack"){
      buttons.push(
        <button key={this.props.buttonDisplay} className="btn-prime"
                disabled={this.props.updateStatus !== 'Update'}
                title={this.props.updateStatus + " " + this.props.packName} onClick={this.props.update}>
                <Glyphicon glyph="cloud-download" /> {this.props.updateStatus+" to " + this.props.newPackVersion}
        </button>);
    }else if (this.props.buttonDisplay === "downloadPack") {
      for (var versions in this.props.packVersion) {
        var versionNumber = this.props.packVersion[versions];
        optionArray.unshift(<option key={versions} value={versionNumber}>{versionNumber}</option>)
      }
      versionDisplay = (<FormGroup className="pull-right" controlId="formControlsSelect" style={{width: "100px", marginRight: "10px"}}>
                          <FormControl onChange={this.props.handleVersion} componentClass="select" placeholder="select"  disabled={this.props.installStatus !== 'Install'}>
                            {optionArray}
                          </FormControl>
                        </FormGroup>);
      buttons.push(
        <button key={this.props.buttonDisplay} className="btn-prime"
                style={style.packCardButton} title={"Install " + this.props.packName}
                onClick={this.props.install} disabled={this.props.installStatus !== 'Install'}>
                <Glyphicon glyph="cloud-download" /> {this.props.installStatus}
        </button>);
    }else if (this.props.buttonDisplay === "installedPack") {
      buttons.push(
        <button key={this.props.buttonDisplay} className="btn-second"
                title={this.props.removeStatus + " " + this.props.packName} disabled={this.props.removeStatus !== 'Uninstall'}
                onClick={this.props.uninstall}>
                <Glyphicon glyph="trash" /> {this.props.removeStatus}
        </button>);
    }
    return(
        <div style={style.cardLayout}>
          <div className="pull-right" style={style.cardBody} title="Number of Downloads">
            <Glyphicon glyph="cloud-download" style={{color: "var(--text-color-light)"}}/>{" " + this.props.numOfDownloads}
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
