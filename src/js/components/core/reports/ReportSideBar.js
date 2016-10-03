const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup, Button} = RB;
const ReportFilters = require("./ReportFilters.js");

class ReportSideBar extends React.Component{
  constructor() {
    super();
    this.state = {
      searchValue: '',
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
     this.setState({searchValue: e.target.value});
  }

  handleSearchClick(){
    this.query.search = this.state.searchValue;
    this.props.getQuery(this.query);
  }

  render(){
    return(
      <div style={{backgroundColor: "#333333", width: "25%", height: "100vh", marginLeft: "0px", position: "fixed", zIndex: "99", left: "0px", fontSize: "12px", color: "white", overflowX: "hidden", overflowY: "auto"}}>
        <div style={{marginLeft:"30px", display: "fixed"}}>
          <h3 style={{marginTop: "20px"}}>Translation Report</h3>
        </div>
        <FormGroup bsSize="small" style={{marginLeft: "30px", width: "80%", bottom: "0px"}}>
          <ControlLabel>
            <center><h4>Filter:</h4></center>
          </ControlLabel>
          <FormControl componentClass="select" multiple placeholder="Status" onChange={this.filterByStatus.bind(this)}>
            <option value="">All</option>
            <option value="CORRECT">Correct</option>
            <option value="FLAGGED">Flagged</option>
            <option value="UNCHECKED">Unchecked</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Form" onChange={this.filterByForm.bind(this)}>
            <option value="">All</option>
            <option value="Retained">Retained</option>
            <option value="Replaced">Replaced</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" multiple placeholder="Notes" onChange={this.filterByNotes.bind(this)}>
            <option value="">All</option>
            <option value="true">With Notes</option>
            <option value="false">Without Notes</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Proposed Changes" onChange={this.filterByProposed.bind(this)}>
            <option value="">All</option>
            <option value="true">With Proposed Changes</option>
            <option value="false">Without Proposed Changes</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Chapter" onChange={this.filterByChapter}>
            <option value="Chapter">Chapter</option>
            {/*chapterArray*/}
          </FormControl>
          <InputGroup style={{marginTop:"30px"}}>
            <FormControl type="text"  value={this.state.searchValue} placeholder="Search" style={{height: "34px", fontSize: "16px"}} onChange={this.handleSearchChange.bind(this)}/>
            <InputGroup.Button>
              <Button onClick={this.handleSearchClick.bind(this)} style={{background: "#44c6ff"}}><Glyphicon glyph="search" style={{color: "white", fontSize: "16px"}}/></Button>
            </InputGroup.Button>
          </InputGroup>
          <center>
            {this.props.reportHeadersOutput}
            <h5>Completed: {this.props.completed}</h5>
            <h5>Flagged: {this.props.flagged}</h5>
            <h5>Unfinished: {this.props.unfinished}</h5>
            <br />
            <h5 style={{color: "#44c6ff"}}>{`Report for ${this.props.bookName} `}<br />
            <small>
              {"\n By " + this.props.authors + ","} <br /> {"created on " + new Date().toDateString()}
            </small>
            </h5>
          </center>
        </FormGroup>
      </div>
    );
  }

  }

  module.exports = ReportSideBar;
