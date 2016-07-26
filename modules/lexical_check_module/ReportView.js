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
  for(let i in checks) {
    checkList.push(
      <ReportItem check={checks[i]} key={i} />
    );
  }
  return (
    <Well>
      <h3 style={{marginTop: '-5px'}}>Lexical Check</h3>
      {checkList}
    </Well>
  );
}

function getChecksByVerse(chapter, verse) {
  var res = [];
  var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
  for(var group of groups) {
    for(var check of group.checks) {
      if(check.chapter === chapter && check.verse === verse) {
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

  render() {
    return (
      <Well>
        <h3 style={{marginTop: '-5px'}}>{this.props.check.wordFile.replace(extensionRegex, '')}</h3>
        <div>Selected word: {this.props.check.mappedWord}</div>
        <div>Check status: {this.props.check.checkStatus}</div>
        <div style={{fontSize: '75%', color: '#7e7b7b', paddingTop: '10px'}}>{this.props.check.user} - {this.props.check.timeStamp}</div>
      </Well>
    );
  }
}

module.exports = ReportView;
window.ReportView = ReportView;