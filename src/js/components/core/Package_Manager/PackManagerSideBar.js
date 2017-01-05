/******************************************************************************
 *@author: Manny Colon
 *@description: This component takes on props from PackageManagerView.js
 in order to display cards for each of the apps/packages found
*******************************************************************************/
const React = require('react');

class PackManagerSideBar extends React.Component{
  constructor() {
    super();
  }

  render() {
    return(
      <div style={this.props.style.sideBar}>
        <div onClick={this.props.hidePackManager} title="Go Back to Main Screen" style={{cursor: "pointer"}}>
          <img src="images/TC_Icon_logo.png" style={this.props.style.tcLogo}/>
          <span style={this.props.style.heading}> TranslationCore</span>
          <br /><br />
        </div>
        {this.props.children}
      </div>
    );
  }
}
module.exports = PackManagerSideBar;
