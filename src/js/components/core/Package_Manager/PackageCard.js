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
    };
  }

  install(name) {
    PackageManager.download(name, function(err, data){
      if(!err) {
      //TODO: Add way to update icon from install to update  
      }
    });
  }

  render(){
    let title = "Install " + this.props.packName;
    return(
        <div style={style.cardLayout}>
          <div className="pull-right" style={style.cardBody} title="Number of Downloads"><Glyphicon glyph="cloud-download" style={{color: "#555555"}}/>{" " + this.props.numOfDownloads}</div>
          <h4 style={{marginTop: "0px"}}>
            {this.props.packName}
            <span style={style.versionText}>{" " + this.props.packVersion}</span>
          </h4>
          <span style={style.cardBody}>{this.props.description}</span>
          <div style={{marginTop: "10px"}}>
            <div className="pull-right">
              <Button bsStyle="primary" style={style.packCardButton} title={title} onClick={this.install.bind(this, this.props.packName)}>
                <Glyphicon glyph="cloud-download" /> Install
              </Button>
            </div>
            <img style={style.packIcon} src={this.props.iconPathName} />
          </div>

        </div>
    );
  }
}
module.exports = PackageCard;
