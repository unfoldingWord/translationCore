
const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");
const updateLoginModal = require('../../../actions/CoreActionsRedux.js').updateLoginModal;
const showLoginProfileModal = require('../../../actions/CoreActionsRedux.js').showLoginProfileModal;
const { connect  } = require('react-redux');

class LoginButton extends React.Component{
  constructor(){
    super();
    this.state ={
      hover: false,
      online: CoreStore.getOnlineStatus(),
    }
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateOnlineStatus);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateOnlineStatus);
  }

  handleClick(){
    this.props.dispatch(showLoginProfileModal(true));
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

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  return Object.assign({}, state, state.modalReducers.login_profile);
}

module.exports = connect(mapStateToProps)(LoginButton);
