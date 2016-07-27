
const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");

class LoginButton extends React.Component{
  constructor(){
    super();
    this.state ={
      hover: false,
      online: false,
    }
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateOnlineStatus.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateOnlineStatus.bind(this));
  }

  handleClick(){
    CoreActions.updateLoginModal(true);
  }

  updateOnlineStatus(){
    this.setState({online: CoreStore.getOnlineStatus()});
  }

  mouseEnter(){
    this.setState({hover: true});
  }

  mouseLeave(){
    this.setState({hover: false});
  }

      render(){
        const linkStyle = this.state.hover ? style.hover : style.li;
        const GlyphStyle = this.state.hover ? style.glyphiconHover : style.glyphicon;

        let userName = "Sign in";
        let profilePicture = <Glyphicon glyph="user" style={GlyphStyle}/>
        if(this.state.online === true){
        let user = CoreStore.getLoggedInUser();
        userName = user.username;
        let temp = user.avatar_url;
        profilePicture = <Image style={{height: '45px', width:'45px'}} src={temp} circle />
        }
        return(
          <div>
              <li style={linkStyle} onClick={this.handleClick.bind(this)} onMouseEnter={this.mouseEnter.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
                  {profilePicture}<br/>{userName}</li>
          </div>
        );
      }

}

module.exports = LoginButton;
