
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, ButtonGroup} = RB;

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
        <ButtonGroup style={{width:'100%', paddingBottom: "2.5px"}}>
          <Button style={{width:'33.33%'}} bsStyle="success" onClick={function() {_this.setFlagStateFunction('RETAINED');}}>
            <Glyphicon glyph="ok" /> Retain</Button>
          <Button style={{width:'33.33%'}} bsStyle="warning" onClick={function() {_this.setFlagStateFunction('REPLACED');}}>
            <Glyphicon glyph="random" /> Changed</Button>
          <Button style={{width:'33.33%'}} bsStyle="danger" onClick={function() {_this.setFlagStateFunction('WRONG');}}>
            <Glyphicon glyph="remove" /> Wrong</Button>
        </ButtonGroup>
    );
  }
}

module.exports = FlagDisplay;
