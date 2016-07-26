
const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./sideBarStyle");

class SideNavBar extends React.Component{
  constructor(){
    super();
    this.state ={
      hover: false,
      online: false,
    }
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateButtonStatus.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateButtonStatus.bind(this));
  }

  handleClick(){
    CoreActions.updateLoginModal(true);
  }

  updateButtonStatus(){
    this.setState({online: CoreStore.getButtonStatus()});
  }

  handleCreateProject(){
    CoreActions.showCreateProject("Languages");
  }

  handleOpenProject(){
    CoreActions.showOpenModal(true);
  }

  handleSaveProject(){
  let path = api.getDataFromCommon('saveLocation');
  CheckStore.saveAllToDisk(path, function() {});
  }

  handleSettings(){
  CoreActions.updateSettings(true);
  }

  toggleHover(){/*
    this.setState({hover: !this.state.hover});*/
  }

    render(){
      const linkStyle = this.state.hover ? style.hover : style.li;
      const GlyphStyle = this.state.hover ? style.glyphiconHover : style.glyphicon;

      let userName = "Sign in";
      let profilePicture = <Glyphicon glyph="user" style={style.glyphicon}/>
      if(this.state.online === true){
      let user = CoreStore.getLoggedInUser();
      userName = user.username;
      let pic = user.avatar_url;
      profilePicture = <Image style={{height: '45px', width:'45px'}} src={pic} circle />
      }
      return(
        <div style={style.container}>
          <ul style={style.ul}>

            <li style={style.li} onClick={this.handleClick.bind(this)} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                {profilePicture}<br/>{userName}</li>
            <li style={linkStyle} onClick={this.handleCreateProject.bind(this)} onMouseEnter={this.toggleHover.bind(this)} onMouseLeave={this.toggleHover.bind(this)}>
                <Glyphicon glyph="file" style={GlyphStyle}/><br/>New</li>
            <li style={linkStyle} onClick="" onMouseEnter={this.toggleHover.bind(this)} onMouseLeave={this.toggleHover.bind(this)}>
                <Glyphicon glyph="time" style={GlyphStyle}/><br/>Recent</li>
            <li style={linkStyle} onClick={this.handleOpenProject.bind(this)} onMouseEnter={this.toggleHover.bind(this)} onMouseLeave={this.toggleHover.bind(this)}>
                <Glyphicon glyph="folder-open" style={GlyphStyle}/><br/>Open</li>
            <li style={linkStyle} onClick={this.handleSaveProject.bind(this)} onMouseEnter={this.toggleHover.bind(this)} onMouseLeave={this.toggleHover.bind(this)}>
                <Glyphicon glyph="floppy-save" style={GlyphStyle}/><br/>Save</li>
            <li style={linkStyle} onClick={this.handleSettings.bind(this)} onMouseEnter={this.toggleHover.bind(this)} onMouseLeave={this.toggleHover.bind(this)}>
                <Glyphicon glyph="cog" style={GlyphStyle}/><br/>Settings</li>
          </ul>
        </div>
      );
    }

}

module.exports = SideNavBar;
