/******************************************************************************
 *@author: Manny Colon
 *@description: This component is a button design that includes hover options
 for the  PackManagerSideBar.js
*******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactDOM = require("react-dom");
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const style = require("./Style");

class SideBarButton extends React.Component{
  constructor(){
    super();
    this.state ={
      hover: false,
    }
  }

  mouseEnter(){
    this.setState({hover: true});
  }

  mouseLeave(){
    this.setState({hover: false});
  }

  render(){
    const linkStyle = this.state.hover ? style.sideBarButtonHover : style.sideBarButton;
    const GlyphStyle = this.state.hover ? style.sideBarGlyphHover : style.sideBarGlyph;
    const iconImage = this.state.hover ? this.props.hoverImage : this.props.imageName;
    let icon;
    if(iconImage){
      icon = <img src={iconImage} style={style.imgSize}/>;
    }else{
      icon = <Glyphicon glyph={this.props.glyphicon} style={GlyphStyle}/>;
    }
    return(
      <div style={linkStyle} title={this.props.title}
          onMouseEnter={this.mouseEnter.bind(this)}
          onMouseLeave={this.mouseLeave.bind(this)} onClick={this.props.handleButtonClick}>
        {icon}{this.props.value}
      </div>
    );
  }
}

module.exports = SideBarButton;
