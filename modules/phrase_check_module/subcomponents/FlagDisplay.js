
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, ButtonGroup, Glyphicon} = RB;

class FlagDisplay extends React.Component{

  componentWillMount(){
    api.registerAction('setFlagState', (data, action) => {
      var currentGroupIndex = data.currentGroupIndex;
      var currentCheckIndex = data.currentCheckIndex;
      var currentCheck = data.groups[currentGroupIndex][currentCheckIndex];
      currentCheck.checkStatus = action.checkStatus;
    });
  }

  render(){
    var _this = this;
    return (
      <ButtonGroup vertical block>
        <Button bsStyle="success" onClick={
            function() {
              var action = {
                type: "setFlagState",
                field: "PhraseCheck",
                checkStatus: "RETAIN"
              };
              api.sendAction(action);
            }
          }><Glyphicon glyph="ok" /> Retain</Button>
        <Button bsStyle="warning" onClick={
            function() {
              api.sendAction({type: "setFlagState", field: "PhraseCheck", checkStatus: "REPLACED"})
            }
          }><Glyphicon glyph="random" /> Changed</Button>
        <Button bsStyle="danger" onClick={
            function() {
              api.sendAction({type: "setFlagState", field: "PhraseCheck", checkStatus: "WRONG"})
            }
        }><Glyphicon glyph="remove" /> Wrong</Button>
      </ButtonGroup>
    );
  }
}

module.exports = FlagDisplay;
