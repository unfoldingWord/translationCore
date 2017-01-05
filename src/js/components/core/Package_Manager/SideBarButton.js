/******************************************************************************
 *@author: Manny Colon
 *@description: This component is a button design that includes hover options
 for the  PackManagerSideBar.js
*******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const style = require("./Style");

class SideBarButton extends React.Component{
  constructor(){
    super();
  }

  render(){
    const linkStyle = this.props.hover ? style.sideBarButtonHover : style.sideBarButton;
    const GlyphStyle = this.props.hover ? style.sideBarGlyphHover : style.sideBarGlyph;
    const iconImage = this.props.hover ? this.props.hoverImage : this.props.imageName;
    let icon;
    if(iconImage){
      icon = <img src={iconImage} style={style.imgSize}/>;
    }else{
      icon = <Glyphicon glyph={this.props.glyphicon} style={GlyphStyle}/>;
    }
    return(
      <div style={linkStyle} title={this.props.title}
          onMouseEnter={this.props.updateHover.bind(this, true)}
          onMouseLeave={this.props.updateHover.bind(this, false)} onClick={this.props.handleButtonClick}>
        {icon}{this.props.value}
      </div>
    );
  }
}

module.exports = SideBarButton;
