const api = window.ModuleApi;
const React = api.React;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require("./Style");
const OnlineStatus = require("./OnlineStatus");

class StatusBar extends React.Component{
  constructor(){
    super();
    this.state ={
      currentWordOrPhrase: "",
      currentCheckNamespace: "",
    }
    this.getCurrentCheck = this.getCurrentCheck.bind(this);
    this.currentCheckNamespace = this.currentCheckNamespace.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('goToNext', this.getCurrentCheck);
    api.registerEventListener('goToPrevious', this.getCurrentCheck);
    api.registerEventListener('goToCheck', this.getCurrentCheck);
    api.registerEventListener('changeCheckType', this.currentCheckNamespace);
    //this.getCurrentCheck();
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.getCurrentCheck);
    api.removeEventListener('goToPrevious', this.getCurrentCheck);
    api.removeEventListener('goToCheck', this.getCurrentCheck);
    api.removeEventListener('changeCheckType', this.currentCheckNamespace);
  }

  currentCheckNamespace(){
    let namespace = CoreStore.getCurrentCheckNamespace();
    if(namespace){
      this.setState({currentCheckNamespace: namespace});
      this.getCurrentCheck();
      console.log(this.state.currentCheckNamespace);
    }
  }

  getCurrentCheck(){
    var groups = api.getDataFromCheckStore(this.state.currentCheckNamespace, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(this.state.currentCheckNamespace, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(this.state.currentCheckNamespace, 'currentCheckIndex');
    var currentCheck = groups[currentGroupIndex]['checks'][currentCheckIndex];
    this.setState({currentWordOrPhrase: currentCheck.word})
    console.log(currentCheck.word);
  }

  render(){
    let currentWordOrPhrase = this.state.currentWordOrPhrase;
    return(
      <div style={style.StatusBar} onClick={this.getCurrentCheck.bind(this)}>
          <OnlineStatus />{currentWordOrPhrase}
      </div>
      );
  }
}


module.exports = StatusBar;
