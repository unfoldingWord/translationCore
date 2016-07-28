/**
 * @author Evan "Vegan and Proud" Wiederspan
 * This function will generate and display a report when called. It first opens
 * a local report template HTML file, reads that text into a Node object, then renders
 * the gathered JSX from the above class into that page and saves it to another file in the root
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
const fs = require('fs');
const {BrowserWindow} = require('electron').remote;
const {ipcRenderer} = require('electron');

ipcRenderer.on("report-closed", (event) => {
  reportOpened = false;
});

let reportOpened = false;

class Report extends React.Component {
  constructor() {
    super();
  }

  render() {
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
    let reportViews = [];
    for (let i in listOfChecks){
      let check = listOfChecks[i];
      try {
        let reportView = require(check.location + "\\ReportView" );
        if (typeof reportView != "function") {
          console.log(check.location + "\\ReportView.js did not export a function");
        }
        else {
          reportViews.push(reportView);
        }
      }
      catch(e) {
        console.log(e);
        console.log("No report view found in " + check.location);
      }
    }
    if (reportViews.length == 0) {
      return (<div>{"No report views found"}</div>);
    }
    // array of JSX to be rendered
    // loop through all verses and chapters in the target language
    // and pass them into the ReortView functions
    let verses = [];
    let bookName = targetLang.title || "-bookName-";
    for (let ch in targetLang) {
      // skip if its not a chapter (key should be a number)
      if (/^[0-9]+$/.test(ch) == false) {
        continue;
      }
      for (let v in targetLang[ch]) {
        let reports = [];
        for (let view in reportViews) {
          let viewResult = reportViews[view](ch, v);
          if (viewResult) {
            reports.push(<span key={`${ch}-${v}-${view}`}>{viewResult}</span>);
          }
        }
        if (reports.length > 0) {
          verses.push(<span key={`${ch}-${v}`}><h3>{`${bookName} ${ch}:${v}`}</h3><div>{reports}</div></span>);
        }
      }
    }
    // TODO: Get name of book and authors
    return (
      <div className="page-header">
      <h1>{`Report for ${bookName} `}<small>{"By -authors-, created on " + new Date().toDateString()}</small></h1>
      {verses}
      </div>
    );
  }
}

module.exports = function(callback = (err) => {}) {
  // don't run if a report is already open
  if (reportOpened) {
    ipcRenderer.send('open-report', "");
    return;
  }
  fs.readFile("./src/js/components/core/reports/report-template.html", 'utf-8', (err, data) => {
    if (err) {
      console.log(err, "Report template seems to be missing");
      callback(err);
      return;
    }
    // create a new html fragment in memory based on report-template.html
    let reportHTML = document.createElement("html");
    reportHTML.innerHTML = data;
    // render the ReportView output to new file report.html
    ReactDOM.render(<Report />, reportHTML.getElementsByTagName('div')[0]);
    fs.writeFile(`${__dirname}/report.html`, reportHTML.innerHTML, 'utf-8', (err) => {
      if (err) {
        console.log("Error writing rendered report to disk");
        callback(err);
        return;
      }
      // display the file in a new browser window
      ipcRenderer.send('open-report', `file://${__dirname}/report.html`);
      reportOpened = true;
      callback();
    });
  });

}
