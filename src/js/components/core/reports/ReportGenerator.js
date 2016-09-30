/**
 * @author Evan "Vegan and Proud" Wiederspan, Manny COLON
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
const {Glyphicon, Grid, Row, Col, Button} = RB;
const fs = require('fs');
const {BrowserWindow} = require('electron').remote;
const {ipcRenderer} = require('electron');
const ReportSideBar = require('./ReportSideBar.js')
const path = require('path');
const BooksOfBible = require('../BooksOfBible.js');
// listener event from the main process listening for the report window closing
ipcRenderer.on("report-closed", (event, path) => {
  reportOpened = false;
});
// boolean to keep track of if a report window is currently open
let reportOpened = false;

class Report extends React.Component {
  constructor() {
    super();
    this.state ={
      query: null,
      visibleReport: true,
    };
      this.handleReportVisibility = this.handleReportVisibility.bind(this);
  }

  componentWillMount(){
    api.registerEventListener('ReportVisibility', this.handleReportVisibility);
  }

  componentWillUnmount() {
    api.removeEventListener('ReportVisibility', this.handleReportVisibility);
  }

  handleReportVisibility(param){
    this.setState(param);
  }

  getQuery(query){
    this.setState({query: query});
  }

  hideReport(){
    this.setState({visibleReport: false})
  }

  render() {
    if(!this.state.visibleReport){
      return (<div></div>);
    }else{
    // get all of the checks associated with this project
    const listOfChecks = ModuleApi.getDataFromCommon("arrayOfChecks");
    const targetLang = ModuleApi.getDataFromCommon("targetLanguage");
    if (!listOfChecks) {
      return (<div>{"No project data for checks found"}</div>);
    }
    if (!targetLang) {
      return (<div>{"No target language found"}</div>);
    }
    // array of the functions in the ReportView.js's for the project
    if (this.props.reportViews.length == 0) {
      return (<div>{"No report views found"}</div>);
    }
    // array of JSX to be rendered
    // loop through all verses and chapters in the target language
    // and pass them into the ReportView functions
    let output = [];
    let reportHeadersOutput = [];
    let bookName = "-bookName-";
    let authors = "-authors-";
    let manifest = ModuleApi.getDataFromCommon("tcManifest");
    let params = ModuleApi.getDataFromCommon('params');
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
    // render report header data from this.props.reportViews
    let reportHeaders = [];
    for (let view in this.props.reportViews) {
      let viewResult;
      try { // in case their report view has errors
         viewResult = this.props.reportViews[view](0,0);
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
      //output.push(chHeader);
      var isEmpty = true;
      for (let view in this.props.reportViews) {
        let viewResult = this.props.reportViews[view](ch, 0);
        if (viewResult) {
          reportHeadersOutput.push(<span key={`${ch}-header-${view}`}>{viewResult}</span>);
        }
      }
      // now start getting data for each verse in the chapter
      for (let v in targetLang[ch]) {
        let reports = [];
        for (let view in this.props.reportViews) {
          let viewResult = this.props.reportViews[view](ch, v, this.state.query);
          if (viewResult) {
            reports.push(<span key={`${ch}-${v}-${view}`}>{viewResult}</span>);
            isEmpty = false;
          }
        }
        // only display a row for this verse if it has report view data
        if (reports.length > 0) {
          output.push(
                <Row key={`${ch}-${v}`}>
                {/*commented out the code below since it displays chapter and verse*/}
                {/*<Col xs={2}><h4>{`${ch}:${v}`}</h4></Col>*/}
                  <Col xs={10} style={{paddingRight: "0px"}}>{reports}</Col>
                </Row>
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
      <div style={{overflow: "auto", zIndex: "99"}}>
        <ReportSideBar getQuery={this.getQuery.bind(this)} bookName={bookName}
                      authors={authors} reportHeadersOutput={reportHeadersOutput}
                      hideReport={this.hideReport.bind(this)}/>
        <div style={{backgroundColor: "#333333", width: "88.5%", height: "100vh",
          marginLeft: "0px",
          display: "inline-block",
          position: "fixed",
          zIndex: "99",
          left: "25%",
          fontSize: "12px", overflowX: "hidden", overflowY: "scroll"}}>
          <div style={{width: "100%", height: "20px", backgroundColor: "#333333", position: "fixed", zIndex: "100"}}>
            <Glyphicon glyph="remove" title="Close Report Page"
                        style={{color:"red", cursor: "pointer", position: "fixed", fontSize: "18px", float: "right", right: "2px", top: "3px", zIndex: "101"}}
                        onClick={this.hideReport.bind(this)}/>
          </div>
          <div style={{marginBottom: "20px"}}></div>
          {output}
        </div>
      </div>
    );}
  }
}


module.exports = ReactDOM.render(<Report reportViews={api.getDataFromCommon("reportViews")} />, document.getElementById('reports'));
