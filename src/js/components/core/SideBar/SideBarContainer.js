const api = window.ModuleApi;
const React = api.React;
const SideNavBar = require('./SideNavBar');
const Chevron = require('./Chevron');
const style = require("./Style");
const MenuHeaders = require('../navigation_menu/MenuHeaders');
const CoreActionsRedux = require('../../../actions/CoreActionsRedux.js');

class SideBarContainer extends React.Component{
  render() {
    let sideBarContent;
    if(this.props.SideNavBar || this.props.initShow){
      var sideBarContainerStyle = null;
      sideBarContent = <div style={style.sideBarcontainer}>
                          <img src="images/TC_Icon_logo.png" onClick={this.props.changeView}
                            style={style.logo}/>
                          <SideNavBar handleSyncProject={this.props.handleSyncProject}
                            handleReport={this.props.handleReport} handleSettings={this.props.handleSettings}
                            handlePackageManager={this.props.handlePackageManager}
                          /><br />
                          <div style={{bottom: "0px", position: "absolute"}}>
                            <Chevron color="magenta" glyphicon={"folder-open"}
                                     handleClick={this.props.handleOpenProject}/>
                            <Chevron color="blue" glyphicon={"wrench"}
                                     imagePath={this.props.imgPath}
                                     handleClick={this.props.handleSelectTool}/>
                          </div>
                       </div>;
    }else{
      var chevrons = document.getElementById('fixedChevrons') || {clientHeight: 228};
      if (chevrons) {
        var sideBarContainerStyle = {
              backgroundColor: "#333333",
              width: "120px",
              height: (window.innerHeight - chevrons.clientHeight + 2) + "px",
              bottom: "0px",
              marginLeft: "0px",
              position: "fixed",
              zIndex: "98",
              left: "0px",
              fontSize: "12px",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
          };
      }
      sideBarContent = <div>
                          <div id='fixedChevrons' style={style.fixedChevrons}>
                                  <img src="images/TC_Icon_logo.png" onClick={this.props.changeView}
                                       style={style.logo}/>
                                  <Chevron color="magenta" glyphicon={"folder-open"}
                                           handleClick={this.props.handleOpenProject}/>
                                  <Chevron color="blue" glyphicon={"wrench"}
                                           imagePath={this.props.imgPath}
                                           handleClick={this.props.handleSelectTool}/>
                               </div>
                                <div style={sideBarContainerStyle}>
                                <MenuHeaders ref='menuheaders' subMenuProps={this.props.subMenuProps} currentToolNamespace={this.props.currentToolNamespace} currentGroupObjects={this.props.currentGroupObjects}
                                           isCurrentHeader={this.props.isCurrentHeader} currentCheckIndex={this.props.currentCheckIndex}
                                           currentGroupIndex={this.props.currentGroupIndex} menuClick={this.props.menuClick} currentBookName={this.props.currentBookName}
                                           currentSubGroupObjects={this.props.currentSubGroupObjects} isCurrentSubMenu={this.props.currentCheckIndex}/>
                          </div>
                        </div>;
    }
    return(
      <div>
        {sideBarContent}
      </div>
    );
  }

}

module.exports = SideBarContainer;
