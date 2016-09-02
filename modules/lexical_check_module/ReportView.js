const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Well = ReactBootstrap.Well;
const Panel = ReactBootstrap.Panel;

// TODO: Namespace needs to be hard linked with View.js
const NAMESPACE = 'LexicalChecker';
const TITLE = 'translationWords Check';
const extensionRegex = new RegExp('\\.\\w+\\s*$');

function LexicalReport(chapter, verse) {
  // main header for the whole report
  if (chapter == 0 && verse == 0) {
    let [done, total] = getCheckNumbers();
    return (
      <span>
      <ReportHeader checked={done} total={total} />
      </span>
    );
  }
  var checks = getChecksByVerse(chapter, verse);
  // If there are no checks for this verse, then return undefined.
  // This will make Lexical Check not show at all for this verse.
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
      <h4 style={{marginTop: '-5px', display: 'inline'}}>{TITLE}</h4>
      <div className='pull-right'>{numChecked}/{checks.length} Completed</div>
      {checkList}
    </Well>
  );
}

// Given a chapter and verse, returns all of the checks for that reference
function getChecksByVerse(chapter, verse) {
  var res = [];
  var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
  if (groups == null){
    return [];
  }
  for(var group of groups) {
    for(var check of group.checks) {
      if(check.chapter == chapter && check.verse == verse) {
        // Also appends the gateway language word that we're checking.
        // This is taken from the group.
        check.wordFile = group.group;
        res.push(check);
      }
    }
  }
  return res;
}

function getCheckNumbers() {
  let numChecked = 0;
  let total = 0;
  let groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
  for (let group of groups) {
    for (let check of group.checks) {
      if (check.checkStatus != "UNCHECKED") {
        numChecked++;
      }
      total++;
    }
  }
  return [numChecked, total];
}

//React component that represents a single check
class ReportItem extends React.Component {
	constructor() {
		super();
  }
  headerDiv() {
    if(!this.props.check.wordFile)
      return undefined;
    return (
      <h4 style={{marginTop: '-5px'}}>{this.props.check.wordFile.replace(extensionRegex, '')}</h4>
    );
  }
  prettySelectedWords() {
    if(!this.props.check.selectedWords)
      return undefined;
    return this.props.check.selectedWords.join(", ");
  }
  selectedWordsDiv() {
    var selectedWords = this.prettySelectedWords();
    if(!selectedWords)
      return undefined;
    return (
      <div>Selected word: {this.prettySelectedWords()}</div>
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
  commentsDiv() {
    if(!this.props.check.comment)
      return undefined;
    return (
      <div>Comments: {this.props.check.comment}</div>
    );
  }
  footerDiv() {
    if(this.props.check.user) {
      var user = this.props.check.user.fullName;
    }
    if(this.props.check.timestamp) {
      // We do 'new Date(...)' because it could be a string or a Date object.
      var timestamp = new Date(this.props.check.timestamp).toDateString();
    }
    return (
      <div style={{fontSize: '75%', color: '#7e7b7b', paddingTop: '10px'}}>{user || 'Anonymous'} - {timestamp || ''}</div>
    );
  }
  render() {
    return (
      <Well style={{background: 'rgb(255, 255, 255)'}}>
        {this.headerDiv()}
        {this.checkStatusDiv()}
        {this.selectedWordsDiv()}
        {this.proposedChangesDiv()}
        {this.commentsDiv()}
        {this.footerDiv()}
      </Well>
    );
  }
}

class ReportHeader extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
    <Panel header="Lexical Check">
      {`${this.props.checked} / ${this.props.total} checks completed`}
    </Panel>
    );
  }
}

module.exports = LexicalReport;
