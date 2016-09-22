const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, Row, Col, Well, Panel} = RB;

// TODO: Namespace needs to be hard linked with View.js
const NAMESPACE = 'TranslationNotesChecker';
const TITLE = ' TranslationNotes: ';
const extensionRegex = new RegExp('\\.\\w+\\s*$');

function TranslationNotesReport(chapter, verse) {
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
  // This will make TranslationNotes Check not show at all for this verse.
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
      <Well style={{background: "rgb(255, 255, 255)", padding: "5px"}}>
      <h3 style={{marginTop: '-5px', display: 'inline', color: "#44c6ff"}}>{TITLE}</h3>
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
      <div style={{float: 'left'}}>{this.props.check.wordFile.replace(extensionRegex, '')}</div>
    );
  }
  prettySelectedWords() {
    if(!this.props.check.selectedWords)
      return undefined;
    return this.props.check.selectedWords;
  }
  selectedWordsDiv() {
    var selectedWords = this.prettySelectedWords();
    if(!selectedWords)
      return undefined;
    return (
      <div>
        <span style={{fontWeight: "bold"}}>Word/Phrase: </span><br />{this.prettySelectedWords()}
      </div>
    );
  }
  checkStatusDiv() {
    if(!this.props.check.checkStatus)
      return undefined;
    let status;
    let linkStyle;
    switch (this.props.check.checkStatus) {
      case "FLAGGED":
        status = <Glyphicon glyph="flag" />;
        linkStyle={color: 'red'};
        break;
      case "CORRECT":
        status = <Glyphicon glyph="ok" />;
        linkStyle={color: 'green'};
        break;
      default:
        //do nothing
    }
    return (
      <div className='pull-right' style={linkStyle}> Status: {status}</div>
    );
  }

  retainedMeaningDiv(){
    if(!this.props.check.retained)
      return undefined;
    return (
    <div>
      <span style={{fontWeight: "bold"}}>The meaning has been: </span><br />{this.props.check.retained}
    </div>
    );
  }

  proposedChangesDiv() {
    if(!this.props.check.proposedChanges)
      return undefined;
    return (
      <div>
        <span style={{fontWeight: "bold"}}>Proposed Changes: </span><br />{this.props.check.proposedChanges}
      </div>
    );
  }
  commentsDiv() {
    if(!this.props.check.comment)
      return undefined;
    return (
      <div>
        <span style={{fontWeight: "bold"}}>Notes: </span><br />{this.props.check.comment}
      </div>
    );
  }
  footerDiv() {
    let user;
    if(this.props.check.user) {
      user = this.props.check.user.userName;
    }else{
      user = 'Anonymous';
    }
    if(this.props.check.timestamp) {
      // We do 'new Date(...)' because it could be a string or a Date object.
      var timestamp = new Date(this.props.check.timestamp).toDateString();
    }
    return (
      <div style={{fontSize: '75%', color: '#7e7b7b', paddingTop: '10px'}}>{user} - {timestamp || ''}</div>
    );
  }
  render() {
    return (
      <Well>
        <Row className="show-grid" style={{marginBottom:"15px", marginTop:"-25px", width: "100%"}}>
      <center>
        <h4 style={{paddingLeft:"5px"}}>
          {this.headerDiv()}
          {this.checkStatusDiv()}
        </h4>
        </center>
        <br />
        </Row>
        <Row className="show-grid">
        <Col xs={4} md={4} lg={4}>
          {this.selectedWordsDiv()}
        </Col>
        <Col xs={4} md={4} lg={4}>
          {this.proposedChangesDiv()}
        </Col>
        <Col xs={4} md={4} lg={4}>
        {this.retainedMeaningDiv()}
        </Col>
        <Col xs={12} md={12} lg={12}>
        <div style={{width: "100%"}}>
          {this.commentsDiv()}
          {this.footerDiv()}
        </div>
        </Col>
        </Row>
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
    <Panel header="TranslationNotes Check">
      {`${this.props.checked} / ${this.props.total} checks completed`}
    </Panel>
    );
  }
}













module.exports = TranslationNotesReport;
