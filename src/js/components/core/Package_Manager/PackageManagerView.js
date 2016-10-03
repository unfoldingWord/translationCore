/**
 *@author: Manny Colon
 *@description: This component handles the view for The apps/plugins/modules
 package manager.
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactDOM = require("react-dom");
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup, Button} = RB;
const Style = require("./Style");
const PackageCard = require("./PackageCard");
const PackManagerSideBar = require("./PackManagerSideBar");

class PackageManagerView extends React.Component{
  constructor() {
    super();
    this.state = {
      visiblePackManager: true,
    };
    this.handlePackManagerVisibility = this.handlePackManagerVisibility.bind(this);
  }

  componentWillMount(){
    api.registerEventListener('PackManagerVisibility', this.handlePackManagerVisibility);
  }

  componentWillUnmount() {
    api.removeEventListener('PackManagerVisibility', this.handlePackManagerVisibility);
  }

  handlePackManagerVisibility(param){
    this.setState(param);
  }

  hidePackManager(){
    this.setState({visiblePackManager: false});
  }

  render(){
    if(!this.state.visiblePackManager){
      return (<div></div>);
    }else{
      return(
        <div style={Style.layout}>
          <PackManagerSideBar hidePackManager={this.hidePackManager.bind(this)}/>
          <div style={Style.header}></div>
          <Glyphicon glyph="remove" title="Close Package Manager" style={Style.removeGlypcIcon}
              onClick={this.hidePackManager.bind(this)}/>
            <PackageCard packName={"TranslationNotes-tC"} packVersion={"0.1.0"} numOfDownloads={"30"} description={"This is a tool to check the grammatical structure of phrases."} iconPathName={"modules/translationNotes_Check_plugin/icon.png"}/>
            <PackageCard packName={"TranslationWords-tC"} packVersion={"0.3.0"} numOfDownloads={"68"} description={"The translationWords check works by providing translators with clear, concise definitions and translation suggestions for every important word in the Bible."} iconPathName={"modules/translationWords_Check_plugin/icon.png"}/>
            <PackageCard packName={"Example Check Module"} packVersion={"0.1.0"} numOfDownloads={"10"} description={"This is an example check app for reference for developers."} iconPathName={"modules/example_check_module/icon.png"}/>
            <PackageCard packName={"TranslationNotes-tC"} packVersion={"0.1.0"} numOfDownloads={"30"} description={"This is a tool to check the grammatical structure of phrases."} iconPathName={"modules/translationNotes_Check_plugin/icon.png"}/>
            <PackageCard packName={"TranslationWords-tC"} packVersion={"0.3.0"} numOfDownloads={"68"} description={"The translationWords check works by providing translators with clear, concise definitions and translation suggestions for every important word in the Bible."} iconPathName={"modules/translationWords_Check_plugin/icon.png"}/>
            <PackageCard packName={"Example Check Module"} packVersion={"0.1.0"} numOfDownloads={"10"} description={"This is an example check app for reference for developers."} iconPathName={"modules/example_check_module/icon.png"}/>
            <PackageCard packName={"TranslationNotes-tC"} packVersion={"0.1.0"} numOfDownloads={"30"} description={"This is a tool to check the grammatical structure of phrases."} iconPathName={"modules/translationNotes_Check_plugin/icon.png"}/>
            <PackageCard packName={"TranslationWords-tC"} packVersion={"0.3.0"} numOfDownloads={"68"} description={"The translationWords check works by providing translators with clear, concise definitions and translation suggestions for every important word in the Bible."} iconPathName={"modules/translationWords_Check_plugin/icon.png"}/>
            <PackageCard packName={"Example Check Module"} packVersion={"0.1.0"} numOfDownloads={"10"} description={"This is an example check app for reference for developers."} iconPathName={"modules/example_check_module/icon.png"}/>
        </div>
      );
    }
  }

}
module.exports = ReactDOM.render(<PackageManagerView />, document.getElementById('package_manager'));
