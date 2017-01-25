const React = require('react');
const api = window.ModuleApi;
const { connect  } = require('react-redux');
const LoginActions = require('../actions/LoginActions.js');
const { Tabs, Tab } = require('react-bootstrap/lib');
const Login = require('../components/core/login/Login.js');
const Profile= require('../components/core/login/Profile');

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

            </Tab>
          </Tabs>
        </div>
      )
    }
}


function mapStateToProps(state) {
    return Object.assign({}, state, state.loginReducer);
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
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ApplicationModalContainer);
