const api = window.ModuleApi;
const React = api.React;
const SideNavBar = require('./SideNavBar');
const Chevron = require('./Chevron');
const style = require("./Style");
const MenuHeaders = require('../navigation_menu/MenuHeaders');


class SideBarContainer extends React.Component{
  render() {
    let sideBarContent;
    if(this.props.SideNavBar || this.props.initShow){
      sideBarContent = <div>
                          <SideNavBar /><br />
                          <div style={{bottom: "0px", position: "absolute"}}>
                            <Chevron color="magenta" glyphicon={"folder-open"}
                                     textValue={"Load"}
                                     handleClick={this.props.handleOpenProject}/>
                            <Chevron color="blue" glyphicon={"wrench"}
                                     textValue={"Tools"}
                                     imagePath={this.props.imgPath}
                                     handleClick={this.props.handleSelectTool}/>
                          </div>
                       </div>;
    }else{
      sideBarContent = <div>
                          <Chevron color="magenta" glyphicon={"folder-open"}
                                   textValue={"Load"}
                                   handleClick={this.props.handleOpenProject}/>
                          <Chevron color="blue" glyphicon={"wrench"}
                                   textValue={"Tools"}
                                   imagePath={this.props.imgPath}
                                   handleClick={this.props.handleSelectTool}/>
                          <MenuHeaders ref='menuheaders' menuHeadersItemsProps={this.props.menuHeadersItemsProps} {...this.props.menunHeaderProps} currentToolNamespace={this.props.currentToolNamespace} {...this.props.menuHeadersProps}/>
                       </div>;
    }
    return(
      <div style={style.sideBarcontainer}>
        <img src="images/TC_Icon_logo.png" onClick={this.props.changeView}
             style={style.logo}/>
        {sideBarContent}
      </div>
    );
  }

}

module.exports = SideBarContainer;
