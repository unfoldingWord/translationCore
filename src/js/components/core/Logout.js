const React = require('react');

const Button = require('react-bootstrap/lib/Button');
const CoreActions = require('../../actions/CoreActions.js');
const CoreStore = require('../../stores/CoreStore.js');
const style = require('../../styles/loginStyle');


class Logout extends React.Component{
  constructor(){
    super();
    this.state = {visibleLogout: false};
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateLogoutButton.bind(this));
    CoreActions.updateLogoutButton(false);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateLogoutButton.bind(this));
  }

  updateLogoutButton(){
    this.setState({visibleLogout: CoreStore.getLogoutButton()});
  }
//handleLogout is not fully functional we still have to work on actually Logout
//from Door43
  handleLogout(){
    CoreActions.updateButtonStatus(false);
    CoreActions.updateLogoutButton(false);
    CoreActions.updateProfileVisibility(false);
  }

  render(){
    let lButton;
    if(this.state.visibleLogout === true){
      lButton = <div><Button bsStyle="warning" style={style.NavBarbutton}
      onClick={this.handleLogout.bind(this)}>Logout</Button></div>
    }
    return(
      <div>
        {lButton}
      </div>
    );
  }
}


module.exports = Logout;
