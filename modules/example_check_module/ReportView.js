const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Well = ReactBootstrap.Well;

// TODO: Namespace needs to be hard linked with View.js
const NAMESPACE = 'ExampleChecker';
const extensionRegex = new RegExp('\\.\\w+\\s*$');

function ExampleCheckerReport(chapter, verse) {
  var checks = getChecksByVerse(chapter, verse);
  // If there are no checks for this verse, then return undefined.
  // This will make Example Check not show at all for this verse.
  if(checks.length == 0) {
    return undefined;
  }
  var checkList = [];
  var numChecked = 0;
  for(let i in checks) {
    // Only show this specific check if is marked as checked
    // TODO: Maybe it should still show if there are comments/selectedWords/proposedChanges
    // even if it is UNCHECKED
    if(checks[i].checkStatus !== "UNCHECKED") {
      checkList.push(
        <ReportItem check={checks[i]} key={i} />
      );
      numChecked++;
    }
  }
  return (
    <Well>
      <h4 style={{marginTop: '-5px', display: 'inline'}}>Example Check</h4>
      <div className='pull-right'>{numChecked}/{checks.length} Completed</div>
      {checkList}
    </Well>
  );
}

// Given a chapter and verse, returns all of the checks for that reference
function getChecksByVerse(chapter, verse) {
  var res = [];
  var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
  for(var group of groups) {
    for(var check of group.checks) {
      if(check.chapter == chapter && check.verse == verse) {
        // Also appends the group name to the check
        check.group = group.group;
        res.push(check);
      }
    }
  }
  return res;
}

//React component that represents a single check
class ReportItem extends React.Component {
	constructor() {
		super();
  }
  headerDiv() {
    return (
      <h4 style={{marginTop: '-5px'}}>{this.props.check.group}</h4>
    );
  }
  checkStatusDiv() {
    if(!this.props.check.checkStatus) 
      return undefined;
    return (
      <div>Check status: {this.props.check.checkStatus}</div>
    );
  }
  proposedChangesDiv() {
    if(!this.props.check.proposedChanges) 
      return undefined;
    return (
      <div>Proposed Changes: {this.props.check.proposedChanges}</div>
    );
  }
  footerDiv() {
    return (
      <div style={{fontSize: '75%', color: '#7e7b7b', paddingTop: '10px'}}>{this.props.check.user || 'Anonymous'} - {this.props.check.timestamp || ''}</div>
    );
  }
  render() {
    return (
      <Well style={{background: 'rgb(255, 255, 255)'}}>
        {this.headerDiv()}
        {this.checkStatusDiv()}
        {this.proposedChangesDiv()}
        {this.footerDiv()}
      </Well>
    );
  }
}

module.exports = ExampleCheckerReport;
