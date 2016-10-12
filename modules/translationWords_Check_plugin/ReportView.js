const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, Row, Col, Well, Panel} = RB;
const ReportFilters = api.ReportFilters;


// TODO: Namespace needs to be hard linked with View.js
const NAMESPACE = 'TranslationWordsChecker';
const TITLE = 'translationWords: ';
const extensionRegex = new RegExp('\\.\\w+\\s*$');

function TranslationWordsReport(chapter, verse, query) {
  // main header for the whole report
  if (chapter == 0 && verse == 0) {
    let [done, total] = getCheckNumbers();
    return (
      <span>
      <ReportHeader checked={done} total={total} />
      </span>
    );
  }
  var checks = getChecksByVerse(chapter, verse, query);
  // If there are no checks for this verse, then return undefined.
  // This will make TranslationWords Check not show at all for this verse.
  if(checks.length == 0) {
    return undefined;
  }
  var checkList = [];
  var numChecked = 0;
  var bookChapVer;
  let bookName = "-bookName-";
  let authors = "-authors-";
  let manifest = ModuleApi.getDataFromCommon("tcManifest");
  let params = ModuleApi.getDataFromCommon('params');
  let bookAbbr;
  if (params) bookAbbr = params.bookAbbr;
  if (manifest && (manifest.ts_project || bookAbbr)) {
    bookName = manifest.ts_project.name || BooksOfBible[bookAbbr] || "-bookName-";
  }
  for(let i in checks) {
    bookChapVer = bookName + " " + checks[i].chapter + ":" + checks[i].verse;
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
      <div style={{background:"rgb(68, 198, 255)", padding: "5px", paddingTop: "10px", marginBottom: "5px", color: "white"}}>
        <h3 style={{marginLeft: '5px', display: 'inline'}}>{TITLE}</h3>
        <span style={{fontSize: "18px", color: "black"}}>{bookChapVer}</span>
        <div className='pull-right'><h5>{numChecked}/{checks.length} Completed</h5></div>
        <br /><br />
        {checkList}
      </div>
  );
}

// Given a chapter and verse, returns all of the checks for that reference
function getChecksByVerse(chapter, verse, query) {
  var res = [];
  var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
  if (groups == null){
    return [];
  }
  if (query) {
    groups = query;
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
      <div style={{float: 'left', marginLeft: "10px"}}>{this.props.check.wordFile.replace(extensionRegex, '')}</div>
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
      <Well style={{fontSize: "16px", background:"white", marginBottom: "5px", color: "black"}}>
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
      <div>
        <h5>Translation Words: {`${this.props.checked} / ${this.props.total}`}</h5>
      </div>
    );
  }
}

module.exports = {
  view: TranslationWordsReport,
  namespace: NAMESPACE
};
