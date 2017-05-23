const api = window.ModuleApi;
const React = api.React;
const fs = require('fs');
const { Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup } = require('react-bootstrap/lib');

const ReportFilters = require("./ReportFilters.js");
const style = require("./style");

class ReportSideBar extends React.Component{
  constructor() {
    super();
    this.state = {
    };
    this.query = {};
  }

  filterByStatus(e){
    let options = e.target.options;
    let value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    if(value.length == 1 && value[0] == ""){
      value = null;
    }
    this.query.status =  value;
    this.props.getQuery(this.query);
  }

  filterByForm(e){
    let options = e.target.options;
    let value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    if(value.length == 1 && value[0] == ""){
      value = null;
    }
    this.query.retained =  value;
    this.props.getQuery(this.query);
  }

  filterByNotes(e){
    let options = e.target.value;
    this.query.comments = this.convertToBoolean(options);
    this.props.getQuery(this.query);
  }

  filterByProposed(e){
    let options = e.target.value;
    this.query.proposed = this.convertToBoolean(options);
    this.props.getQuery(this.query);
  }

  convertToBoolean(optionString){
    let x;
    if(optionString == "true"){
      x = true;
    }else if (optionString == "false") {
      x = false;
    }else if(optionString === ""){
      x = null;
    }else{
      console.error("optionString is not equal to 'true' or 'false'");
    }
    return x;
  }

  handleClose(){
    this.props.hideReport();
  }

  handleSearchChange(e){
    let searchValue = e.target.value;
     if(searchValue == null){
       searchValue = "";
     }
     this.query.search = searchValue;
     this.props.getQuery(this.query);
  }

  filterByChapter(e){
    let options = e.target.options;
    let value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if(options[i].value == "" && options[i].selected){
        value = null;
      }else if (options[i].selected) {
        value.push(parseInt(options[i].value));
      }
    }
    this.query.chapter =  value;
    this.props.getQuery(this.query);
  }

  getChapters(){
    let chapterOptionArray = [];
    let arrayOfChap = api.ReportFiltersTools.get.chapters();
    for(let c of arrayOfChap){
      if(c != "title"){
        chapterOptionArray.push(<option key={c} value={c}>{c}</option>);
      }
    }
    return chapterOptionArray;
  }

    generatePDF(){
      const path = require('path');
      let displayCard = document.getElementById("cardsContent");
      var cln = displayCard.cloneNode(true);
      fs.readFile("./src/js/components/core/reports/report-template.html", 'utf-8', (err, data) => {
        if (err) {
          // These errors should not happen
          console.log(err, "Report template seems to be missing");
          callback(err);
          return;
        }
        // create a new html fragment in memory based on report-template.html
        let reportHTML = document.createElement("html");
        reportHTML.innerHTML = data;
        reportHTML.getElementsByTagName('div')[0].appendChild(cln);
        let reportPath = path.join(__dirname, 'report.html');
        fs.writeFile(reportPath, reportHTML.innerHTML, 'utf-8', (err) => {
          if (err) {
            const alert = {
              title: 'Error writing rendered report to disk',
              content: err.message,
              leftButtonText: 'Ok'
            }
            api.createAlert(alert);
            callback(err);
            return;
          }
          const BrowserWindow = require('electron').remote.BrowserWindow;
          const modalPath = path.join('file://', __dirname, './report.html');
          let win = new BrowserWindow({ width: 800, height: 600 });
          win.on('close', function () { win = null });
          win.loadURL(modalPath);
          win.show();
        });
      });
    }

  render(){
    let chapterOptionArray = this.getChapters();
    return(
      <div style={style.ReportSideBar.layout}>
        <FormGroup bsSize="small" style={style.ReportSideBar.FormGroup}>
          <InputGroup>
            <FormControl type="text" placeholder="Search"
                        style={style.searchBox}
                        onChange={this.handleSearchChange.bind(this)}/>
          </InputGroup><br />
          <table>
            <tBody>
          <tr>
            <td style={{padding: "5px"}}>
          <ControlLabel style={{fontSize: "16px"}}>Status:</ControlLabel>
        </td>
        <td style={{padding: "5px"}}>
          <FormControl componentClass="select" style={style.ReportSideBar.FormControl}
                       onChange={this.filterByStatus.bind(this)}>
            <option value="">All</option>
            <option value="CORRECT">Correct</option>
            <option value="FLAGGED">Flagged</option>
            <option value="UNCHECKED">Unchecked</option>
          </FormControl>
        </td>
      </tr>
      <tr>
        <td style={{padding: "5px"}}>
          <ControlLabel style={{fontSize: "16px"}}>Notes:</ControlLabel>
        </td>
        <td style={{padding: "5px"}}>
          <FormControl componentClass="select" style={style.ReportSideBar.FormControl}
                       onChange={this.filterByNotes.bind(this)}>
            <option value="">All</option>
            <option value="true">With Notes</option>
            <option value="false">Without Notes</option>
          </FormControl>
        </td>
      </tr>
      <tr>
        <td style={{padding: "5px"}}>
          <ControlLabel style={{fontSize: "16px"}}>Chapter:</ControlLabel>
        </td>
        <td style={{padding: "5px"}}>
          <FormControl componentClass="select" style={style.ReportSideBar.FormControl}
                       onChange={this.filterByChapter.bind(this)}>
            <option value="">All</option>
            {chapterOptionArray}
          </FormControl>
        </td>
      </tr>
    </tBody>
  </table><br /><br />

          {/*this needs to be re-implemented to include new additions to proposedChanges
            the 2 forms need to be put together into one
            <ControlLabel>Changes:</ControlLabel>
          <FormControl componentClass="select" style=
                       onChange=>
            <option value="">All</option>
            <option value="Retained">Retained</option>
            <option value="Replaced">Replaced</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" style=
                      onChange=>
            <option value="">All</option>
            <option value="true">With Proposed Changes</option>
            <option value="false">Without Proposed Changes</option>
          </FormControl>
          <br />*/}
            <h5 style={{color: "var(--accent-color-light)"}}>{`Report for the book of ${this.props.bookName} `}<br />
              <small>
                {"\n By " + this.props.authors}<br />
                {"Created on " + new Date().toDateString()}
              </small>
            </h5><br />
            <h5>Completed: {this.props.completed + " / " + this.props.unfinished} </h5>
            <h5>Flagged: {this.props.flagged}</h5>
            {this.props.reportHeadersOutput}
        </FormGroup>
        <button className="btn-prime" onClick={this.generatePDF.bind(this)}>
          <Glyphicon glyph="file" style={{fontSize: "20px"}} />  Print PDF
        </button>
      </div>
    );
  }

  }

  module.exports = ReportSideBar;
