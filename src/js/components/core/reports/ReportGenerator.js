/**
 * This function will generate and display a report when called. It first opens
 * a local report template HTML file, reads that text into a Node object, then renders
 * the gathered JSX from the Report class into that page and saves it to another file in the root
 * directory of the project. Using electron-remote, that file is then opened in a new window
 * where the user can then save the rendered report. The main reason it was done this way is
 * that I wanted the report to be displayed in a new Browser window, but browser windows live in
 * separate threads and do not have access to each other's data without a lot of hacky code. Originally
 * I wanted the new window to open and then populate itself, but it did not have access to any of the
 * stores or modules from the other thread. Doing it this way, the data was able to be generated from the
 * main renderer process while still being able to be displayed in a separate window.
**/

const React = require("react");
const ReactDOM = require("react-dom");
const api = window.ModuleApi;
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Row, Col} = RB;
const fs = require('fs');
const {BrowserWindow} = require('electron').remote;
const ReportSideBar = require('./ReportSideBar.js')
const path = require('path');
const BooksOfBible = require('../BooksOfBible.js');
const ReportFilters = api.ReportFilters;
const style = require("./style");

class Report extends React.Component {
  constructor() {
    super();
    this.state ={
      query: null,
    };
  }

  getQuery(query){
    this.setState({query: query});
  }

  getCompletedAndUnfinishedCheks(){
    let numChecked = 0;
    let total = 0;
    let groups = api.getDataFromCheckStore('TranslationWordsChecker', 'groups');
    if(groups != null){
      for (let group of groups) {
        for (let check of group.checks) {
          if (check.checkStatus != "UNCHECKED") {
            numChecked++;
          }
          total++;
        }
      }
    }
    groups = api.getDataFromCheckStore('TranslationNotesChecker', 'groups');
    if(groups != null){
      for (let group of groups) {
        for (let check of group.checks) {
          if (check.checkStatus != "UNCHECKED") {
            numChecked++;
          }
          total++;
        }
      }
    }
    let unfinished = total - numChecked;
    return [numChecked, unfinished];
  }

  getFlaggedChecks(){
    let flaggedChecks = 0;
    let groups = api.getDataFromCheckStore('TranslationWordsChecker', 'groups');
    if(groups != null){
      for (let group of groups) {
        for (let check of group.checks) {
          if (check.checkStatus == "FLAGGED") {
            flaggedChecks++;
          }
        }
      }
    }
    groups = api.getDataFromCheckStore('TranslationNotesChecker', 'groups');
      if(groups != null){
        for (let group of groups) {
          for (let check of group.checks) {
            if (check.checkStatus == "FLAGGED") {
              flaggedChecks++;
            }
          }
        }
      }
    return flaggedChecks;
  }

  render() {
    let { reportVisibility, toolLoaded } = this.props;
    let reportViews = this.props.reportViews;
    //Will need to be passed down from coreStore when reports are used again.
    if(!reportVisibility){
      if(toolLoaded){
        return (
          <div>
          {/*this will change once we implement the projects list for reports*/}
            <button className="btn-prime" onClick={() => this.props.onLoadReports()}>Generate Report</button>
          </div>
        );
      }else{
        return (
          <h1 style={{color: "var(--reverse-color)", marginTop: "0px"}}>
            Please Open a project and Load a Tool
          </h1>
        );
      }
    }else{
    //get the total of completed checks and Unfinished number of checks
    let [done, unfinished] =  this.getCompletedAndUnfinishedCheks();
    //get the total of Flagged checks
    let flaggedChecks = this.getFlaggedChecks();
    // get all of the checks associated with this project
    const listOfChecks = this.props.listOfChecks;
    const targetLang = this.props.targetLang;
    if (!listOfChecks) {
      return (<div>No project data for checks found</div>);
    }
    if (!targetLang) {
      return (<div>No target language found</div>);
    }
    // array of the functions in the ReportView.js's for the project
    if (!reportViews || reportViews.length == 0) {
      return (<div>No report views found</div>);
    }
    // array of JSX to be rendered
    // loop through all verses and chapters in the target language
    // and pass them into the ReportView functions
    let output = [];
    let reportHeadersOutput = [];
    let bookName = "-bookName-";
    let authors = "-authors-";
    let manifest = this.props.manifest;
    let params = this.props.params;
    let bookAbbr;
    if (params) bookAbbr = params.bookAbbr;
    if (manifest && (manifest.ts_project || bookAbbr)) {
      bookName = manifest.ts_project.name || BooksOfBible[bookAbbr] || "-bookName-";
    }
    // This isn't working yet I think, so it pretty much always returns "various checkers"
    if (manifest && manifest.checkers) {
      if (manifest.checkers.length > 1) {
        authors = manifest.checkers.reduce((prev, cur, i) => {
          return (i == 0 ? "" : prev + ", ") + cur.username;
        });
      }
      else if (manifest.checkers.length == 1 && manifest.checkers[0] != null) {
        authors = manifest.checkers[0].username;
      }
      else {
        authors = "various checkers";
      }
    }
    // render report header data from reportViews
    let reportHeaders = [];
    for (let view in reportViews) {
      let viewResult;
      try { // in case their report view has errors
         viewResult = reportViews[view].view(0,0);
      }
      catch (e) {
        continue;
      }
      if (viewResult) {
        reportHeaders.push(<h5 key={`0-0-${view}`}><span>{viewResult}</span></h5>);
      }
    }
    if (reportHeaders.length > 0) {
      reportHeadersOutput.push(<span key="header">{reportHeaders}</span>);
    }
    for (let ch in targetLang) {
      // skip if its not a chapter (key should be a number)
      if (/^[0-9]+$/.test(ch) == false) {
        continue;
      }
      // create chapter header
      var chHeader = <h3 key={`${ch}-header`}>{`${bookName} ${ch}`}</h3>
      var isEmpty = true;
      for (let view in reportViews) {
        if (!reportViews[view].view) {
          continue;
        }
        let viewResult = reportViews[view].view(ch, 0);
        if (viewResult) {
          reportHeadersOutput.push(<span key={`${ch}-header-${view}`}>{viewResult}</span>);
        }
      }
      // now start getting data for each verse in the chapter
      for (let v in targetLang[ch]) {
        let reports = [];
        for (let view in reportViews) {
          var query = this.state.query;
          var reportNameSpace = reportViews[view].namespace;
          var moduleStore = api.getDataFromCheckStore(reportNameSpace, 'groups');
          if (query && moduleStore) {
            moduleStore = ReportFilters.byCustom(query, moduleStore);
          }
          if (!reportViews[view].view) {
            continue;
          }
          let viewResult = reportViews[view].view(ch, v, moduleStore);
          if (viewResult) {
            reports.push(<span key={`${ch}-${v}-${view}`}>{viewResult}</span>);
            isEmpty = false;
          }
        }
        // only display a row for this verse if it has report view data
        if (reports.length > 0) {
          output.push(
                <div key={`${ch}-${v}`}>
                  <Col style={{paddingRight: "0px"}}>{reports}</Col>
                </div>
          );
        }
      }
      if (isEmpty) {
        var index = output.indexOf(chHeader);
        if (~index) {
          output.splice(index, 1);
        }
      }
    }
    // TODO: Get name of book and authors
    return (
      <Row style={{padding: "0px", margin: "0px", display: "flex", height: "520px"}}>
        <Col sm={4} md={4} lg={4} style={{padding: "0px", margin: "0px"}}>
        <ReportSideBar getQuery={this.getQuery.bind(this)} bookName={bookName}
                      authors={authors} reportHeadersOutput={reportHeadersOutput}
                      completed={done}
                      unfinished={unfinished} flagged={flaggedChecks}/>
        </Col>
        <Col sm={8} md={8} lg={8} style={style.reportContainer}>
          <div id="cardsContent">
            {output}
          </div>
        </Col>
      </Row>
    );}
  }
}

module.exports = Report;
