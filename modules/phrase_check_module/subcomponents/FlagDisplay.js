
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, ButtonGroup, Glyphicon} = RB;

const NAMESPACE = 'PhraseChecker';

class FlagDisplay extends React.Component{

  constructor() {
    super();
    this.state = {

    };
    this.setFlagStateFunction = this.setFlagStateFunction.bind(this);
  }

  componentWillMount(){
    
  }

  componentWillUnmount() {
    
  }

  setFlagStateFunction(newCheckStatus) {
    var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentCheck = groups[currentGroupIndex].checks[currentCheckIndex];
    if (currentCheck) {
<<<<<<< HEAD
      currentCheck.checkStatus = newCheckStatus;
      api.emitEvent('changedCheckStatus', {currentCheckNamespace: NAMESPACE});
=======
      currentCheck.checkStatus = action.checkStatus;
      api.emitEvent('changedCheckStatus', {checkStatus: action.checkStatus, 
        groupIndex: currentGroupIndex, checkIndex: currentCheckIndex});
>>>>>>> develop
    }
  }

  render(){
    var _this = this;
    return (
      <ButtonGroup vertical={true} block>
        <Button bsStyle="success" onClick={
            function() {
              _this.setFlagStateFunction('RETAINED');
            }
          }><Glyphicon glyph="ok" /> Retain</Button>
        <Button bsStyle="warning" onClick={
            function() {
              _this.setFlagStateFunction('REPLACED');
            }
          }><Glyphicon glyph="random" /> Changed</Button>
        <Button bsStyle="danger" onClick={
            function() {
              _this.setFlagStateFunction('WRONG');
            }
        }><Glyphicon glyph="remove" /> Wrong</Button>
      </ButtonGroup>
    );
  }
}

module.exports = FlagDisplay;
