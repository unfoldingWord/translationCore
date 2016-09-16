
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, ButtonGroup} = RB;

const CORRECT = "Correct in Context",
      FLAGGED = "Flag for Review";

class CheckStatusButtons extends React.Component{

  constructor() {
    super();
    this.state = {
      selectedOption: "",
    };
    this.setFlagStateFunction = this.setFlagStateFunction.bind(this);
    this.updateSelectedOption = this.updateSelectedOption.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('goToNext', this.updateSelectedOption);
    api.registerEventListener('goToPrevious', this.updateSelectedOption);
    api.registerEventListener('changedCheckStatus', this.updateSelectedOption);
    api.registerEventListener('goToCheck', this.updateSelectedOption);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.updateSelectedOption);
    api.removeEventListener('goToPrevious', this.updateSelectedOption);
    api.removeEventListener('changedCheckStatus', this.updateSelectedOption);
    api.removeEventListener('goToCheck', this.updateSelectedOption);

  }

  updateSelectedOption(){
    let currentCheck = this.props.getCurrentCheck();
    if (typeof currentCheck.retained == "string") {
      this.setState({selectedOption: currentCheck.retained});
    }
  }

  setFlagStateFunction(newCheckStatus){
    this.props.updateCheckStatus(newCheckStatus);
  }

  handleOptionChange(changeEvent){
    this.setState({selectedOption: changeEvent.target.value});
    let currentCheck = this.props.getCurrentCheck();
    currentCheck.retained = changeEvent.target.value;
  }

  render(){
    var _this = this;
    let currentCheck = this.props.getCurrentCheck();
    let checkStatus = currentCheck.checkStatus;
    return (
      <div>
        <ButtonGroup style={{width:'100%', paddingBottom: "2.5px"}}>
          <Button style={{width:'50%'}} bsStyle="success" className={checkStatus == 'CORRECT' ? 'active':''} onClick={
            function() {_this.setFlagStateFunction('CORRECT');}}>
            <Glyphicon glyph="ok" /> {CORRECT}</Button>
          <Button style={{width:'50%'}} bsStyle="danger" className={checkStatus == 'FLAGGED' ? 'active':''} onClick={
            function() {_this.setFlagStateFunction('FLAGGED');}}>
            <Glyphicon glyph="flag" /> {FLAGGED}</Button>
        </ButtonGroup>
        <h4>The meaning has been:</h4>
        <div className="radio-inline">
          <label>
          <input type="radio" value="Retained"
                      checked={this.state.selectedOption === 'Retained'}
                      onChange={this.handleOptionChange.bind(this)} /> Retained
          </label>
        </div>
        <div className="radio-inline">
          <label>
          <input type="radio" value="Replaced"
                      checked={this.state.selectedOption === 'Replaced'}
                      onChange={this.handleOptionChange.bind(this)} /> Replaced
          </label>
          </div>
      </div>
    );
  }
}

module.exports = CheckStatusButtons;
