
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, ButtonGroup} = RB;
const Switch = require('react-flexible-switch');

const NAMESPACE = 'PhraseChecker';


class FlagDisplay extends React.Component{

  constructor() {
    super();
    this.state = {
    };
    this.setFlagStateFunction = this.setFlagStateFunction.bind(this);
  }

  setFlagStateFunction(newCheckStatus, checkStatusBool) {
    var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentCheck = groups[currentGroupIndex].checks[currentCheckIndex];
    if (currentCheck) {
      currentCheck.checkStatus = newCheckStatus;
      if(checkStatusBool == undefined){
        api.Toast.info('Current check was marked as:', newCheckStatus, 2);
      }
      this.setState({checkStatus: newCheckStatus});
      api.emitEvent('changedCheckStatus', {
        checkStatus: newCheckStatus,
        retained: checkStatusBool,
        groupIndex: currentGroupIndex,
        checkIndex: currentCheckIndex
      });
    }
  }

  render(){
    var _this = this;
    var checkStatus = this.state.checkStatus;
    return (
      <div>
        <ButtonGroup style={{width:'100%', paddingBottom: "2.5px"}}>
          <Button style={{width:'50%'}} bsStyle="success" onClick={function() {_this.setFlagStateFunction('CORRECT');}}>
            <Glyphicon glyph="ok" /> Correct in Context</Button>
          <Button style={{width:'50%'}} bsStyle="danger" onClick={function() {_this.setFlagStateFunction('FLAGGED');}}>
            <Glyphicon glyph="flag" /> Flag for Review</Button>
        </ButtonGroup>
        <div style={{float: "right"}}>
        <Switch
          onActive={function() {_this.setFlagStateFunction(checkStatus, "REPLACED");}} onInactive={function() {_this.setFlagStateFunction(checkStatus, "RETAINED");}}
          labels={{on:"Replaced", off:"Retained"}}
          circleStyles={{diameter: 20}}
          switchStyles={{width: 90}}
        />
        </div>
      </div>
    );
  }
}

module.exports = FlagDisplay;
