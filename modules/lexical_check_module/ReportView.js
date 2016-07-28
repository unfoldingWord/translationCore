const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Well = ReactBootstrap.Well;

// TODO: Namespace needs to be hard linked with View.js
const NAMESPACE = 'LexicalChecker';
const extensionRegex = new RegExp('\\.\\w+\\s*$');

function ReportView(chapter, verse) {
  var checks = getChecksByVerse(chapter, verse);
  if(checks.length == 0) {
    return undefined;
  }
  var checkList = [];
  var numChecked = 0;
  for(let i in checks) {
    if(checks[i].checkStatus !== "UNCHECKED") {
      checkList.push(
        <ReportItem check={checks[i]} key={i} />
      );
      numChecked++;
    }
  }
  return (
    <Well>
      <h3 style={{marginTop: '-5px', display: 'inline'}}>Lexical Check</h3>
      <div className='pull-right'>{numChecked}/{checks.length} Completed</div>
      {checkList}
    </Well>
  );
}

function getChecksByVerse(chapter, verse) {
  var res = [];
  var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
  for(var group of groups) {
    for(var check of group.checks) {
      if(check.chapter == chapter && check.verse == verse) {
        check.wordFile = group.group;
        res.push(check);
      }
    }
  }
  return res;
}

class ReportItem extends React.Component {
	constructor() {
		super();
  }

  headerDiv() {
    if(!this.props.check.wordFile) 
      return undefined;
    return (
        <h3 style={{marginTop: '-5px'}}>{this.props.check.wordFile.replace(extensionRegex, '')}</h3>
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
    if(!this.props.check.comments) 
      return undefined;
    return (
      <div>Comments: {this.props.check.comments}</div>
    );
  }

  footerDiv() {
    if(!this.props.check.user && !this.props.check.timeStamp) 
      return undefined;
    return (
      <div style={{fontSize: '75%', color: '#7e7b7b', paddingTop: '10px'}}>{this.props.check.user} - {this.props.check.timeStamp}</div>
    );
  }

  render() {
    return (
      <Well style={{background: 'rgb(255, 255, 255)'}}>
        {this.headerDiv()}
        {this.selectedWordsDiv()}
        {this.checkStatusDiv()}
        {this.proposedChangesDiv()}
        {this.commentsDiv()}
        {this.footerDiv()}
      </Well>
    );
  }
}

module.exports = ReportView;
