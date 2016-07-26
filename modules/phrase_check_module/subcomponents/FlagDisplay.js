
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, ButtonGroup, Glyphicon} = RB;

class FlagDisplay extends React.Component{

  constructor() {
    super();
    this.state = {

    };
    this.setFlagStateFunction = this.setFlagStateFunction.bind(this);
  }

  componentWillMount(){
    api.registerAction('setFlagState', this.setFlagStateFunction);
  }

  componentWillUnmount() {
    api.removeAction('setFlagState', this.setFlagStateFunction);
  }

  setFlagStateFunction(data, action) {
    var currentGroupIndex = data.currentGroupIndex;
    var currentCheckIndex = data.currentCheckIndex;
    var currentCheck = data.groups[currentGroupIndex].checks[currentCheckIndex];
    if (currentCheck) {
      currentCheck.checkStatus = action.checkStatus;
      api.emitEvent('changedCheckStatus', {checkStatus: action.checkStatus, 
        groupIndex: currentGroupIndex, checkIndex: currentCheckIndex});
    }
  }

  render(){
    var _this = this;
    return (
      <ButtonGroup vertical={true} block>
        <Button bsStyle="success" onClick={
            function() {
              var action = {
                type: "setFlagState",
                field: "PhraseChecker",
                checkStatus: "RETAINED"
              };
              api.sendAction(action);
            }
          }><Glyphicon glyph="ok" /> Retain</Button>
        <Button bsStyle="warning" onClick={
            function() {
              api.sendAction({type: "setFlagState", field: "PhraseChecker", checkStatus: "REPLACED"})
            }
          }><Glyphicon glyph="random" /> Changed</Button>
        <Button bsStyle="danger" onClick={
            function() {
              api.sendAction({type: "setFlagState", field: "PhraseChecker", checkStatus: "WRONG"})
            }
        }><Glyphicon glyph="remove" /> Wrong</Button>
      </ButtonGroup>
    );
  }
}

module.exports = FlagDisplay;
