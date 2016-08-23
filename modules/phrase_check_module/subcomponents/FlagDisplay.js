
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const FlagDisplayButton = require("./FlagDisplayButton");

const NAMESPACE = 'PhraseChecker';

class FlagDisplay extends React.Component{

  constructor() {
    super();
    this.state = {

    };
    this.setFlagStateFunction = this.setFlagStateFunction.bind(this);
  }

  setFlagStateFunction(newCheckStatus) {
    var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentCheck = groups[currentGroupIndex].checks[currentCheckIndex];
    if (currentCheck) {
      currentCheck.checkStatus = newCheckStatus;
      api.emitEvent('changedCheckStatus', {
        checkStatus: newCheckStatus,
        groupIndex: currentGroupIndex,
        checkIndex: currentCheckIndex
      });
    }
  }

  render(){
    var _this = this;
    return (
      <div style={{paddingBottom: "2.5px"}}>
        <FlagDisplayButton handleButtonClick={function() {_this.setFlagStateFunction('RETAINED');}}
        glyphicon={"ok"} value={"Retain"} color={"green"} />

        <FlagDisplayButton handleButtonClick={function() {_this.setFlagStateFunction('REPLACED');}}
        glyphicon={"random"} value={"Changed"} color={"yellow"} />

        <FlagDisplayButton handleButtonClick={function() {_this.setFlagStateFunction('WRONG');}}
        glyphicon={"remove"} value={"Wrong"} color={"red"} />
      </div>
    );
  }
}

module.exports = FlagDisplay;
