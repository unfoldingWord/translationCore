const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const api = window.ModuleApi;
const CoreActionsRedux = require('../actions/CoreActionsRedux.js');
const { connect  } = require('react-redux');
const SettingsActions = require('../actions/SettingsActions.js');
const { Tabs, Tab } = require('react-bootstrap/lib');
const Login = require('../components/core/login/Login.js');
const Profile= require('../components/core/login/Profile');
const SettingsModal = require('../components/core/SettingsModal.js');


class ApplicationModalContainer extends React.Component {
    render() {
      let accountDisplay;
      if(this.props.profileModalVisibility){
        accountDisplay = <Profile {...this.props.profileProps} {...this.props.profileProjectsProps}/>
      }else{
        accountDisplay = <Login {...this.props.loginProps}/>
      }
        return (
            <div>
              <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
                    bsStyle="pills"
                    style={{borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%"}}>
                <Tab eventKey={1} title="Account" style={{backgroundColor: "#333333"}}>
                <br />
                <br />
                  {accountDisplay}
                </Tab>
                <Tab eventKey={2} title="Global Settings" style={{backgroundColor: "#333333"}}>
                  <center>
                    <br />
                    <br />
                    <SettingsModal style={{width: '40%'}} {...this.props}/>
                  </center>
                </Tab>
              </Tabs>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state, state.settingsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSettingsChange: (field)=> {
      dispatch(SettingsActions.onSettingsChange(field.target));
    }
  }
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(ApplicationModalContainer);
