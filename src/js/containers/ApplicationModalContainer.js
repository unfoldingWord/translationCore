const React = require('react');
const api = window.ModuleApi;
const { connect  } = require('react-redux');
const LoginActions = require('../actions/LoginActions.js');
const SettingsActions = require('../actions/SettingsActions.js');
const { Tabs, Tab } = require('react-bootstrap/lib');
const Login = require('../components/core/login/Login.js');
const Profile= require('../components/core/login/Profile');
const Settings = require('../components/core/Settings.js');

class ApplicationModalContainer extends React.Component {
    render() {
      let { loggedInUser } = this.props;
      let accountDisplay;
      if(loggedInUser){
        accountDisplay = <Profile {...this.props}/>
      }else{
        accountDisplay = <Login {...this.props}/>
      }
      return (
        <div>
          <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
                bsStyle="pills"
                style={{borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%"}}>
            <Tab eventKey={1} title="Account" style={{backgroundColor: "#333333"}}>
              {accountDisplay}
            </Tab>
            <Tab eventKey={2} title="Global Settings" style={{backgroundColor: "#333333"}}>
                <Settings {...this.props}/>
            </Tab>
          </Tabs>
        </div>
      )
    }
}


function mapStateToProps(state) {
    return Object.assign({}, state.loginReducer, state.settingsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onHandleUserName: (e) => {
            dispatch(LoginActions.setUserName(e.target.value));
        },
        onHandlePassword: (e) => {
            dispatch(LoginActions.setUserPassword(e.target.value));
        },
        onSwitchToLoginPage: (displayLoginBool) => {
          dispatch(LoginActions.displayLogin(displayLoginBool));
        },
        handleSubmit: (userDataSumbit) => {
          dispatch(LoginActions.loginUser(userDataSumbit));
        },
        onHandleLogout: () => {
          dispatch(LoginActions.logoutUser());
        },
        onSettingsChange: (field)=> {
          dispatch(SettingsActions.onSettingsChange(field.target));
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ApplicationModalContainer);
