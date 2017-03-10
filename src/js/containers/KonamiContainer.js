import React from 'react'
import Konami from 'konami-code-js'
import {connect} from 'react-redux'
import SettingsActions from '../actions/SettingsActions.js'

class KonamiContainer extends React.Component{
  componentWillMount(){
    //Konami Code ( << Up, Up, Down, Down, Left, Right, Left, Right, B, A >> )
    //This is used to enable or disable developer mode
    new Konami(
      ()=>{
        let developerMode = this.props.currentSettings.developerMode;
        this.props.onToggleSettings();
        if(developerMode){
          alert("Developer Mode Disabled");
        } else {
          alert("Developer Mode Enabled: no technical support is provided for translationCore in developer mode!");
        }
      }
    );
  }
  render(){
    return(<div></div>);
  }
}

const mapStateToProps = (state) => {
 return Object.assign({}, state.settingsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
 return {
   onToggleSettings: () => {
     dispatch(SettingsActions.toggleSettings("developerMode")())
   }
 }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(KonamiContainer)
