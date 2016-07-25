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
      <h3>Lexical Checker</h3>
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
      <Row>
        <Col xs={3} style={{paddingRight:'20px', borderRight: '1px solid #ccc'}}>
          <label>{this.props.check.wordFile.replace(extensionRegex, '')}</label>
        </Col>
        <Col xs={9}>
          <p>{this.props.check.checkStatus}</p>
        </Col>
      </Row>
    );
  }
}

module.exports = ReportView;
window.ReportView = ReportView;