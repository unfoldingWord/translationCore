const React = require('react');
const Konami = require('konami-code-js');

var Konami extends React.Component{
  componentWillMount(){
    //Konami Code ( << Up, Up, Down, Down, Left, Right, Left, Right, B, A >> )
    //This is used to enable or disable developer mode
    new Konami(
      ()=>{
        let developerMode = this.props.settingsReducer.currentSettings.developerMode;
        this.props.dispatch(SettingsActions.toggleSettings("developerMode"));
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

module.exports = Konami;
