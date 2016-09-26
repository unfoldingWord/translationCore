const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup, Button} = RB;


class ReportSideBar extends React.Component{


  render(){
    return(
      <div style={{backgroundColor: "#333333", width: "300px", height: "100vh",
      marginLeft: "0px",
      display: "inline-block",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      fontSize: "12px",
      color: "white"}}>
        <div style={{marginLeft:"45px"}}>
          <h4>Translation Report</h4>
          {this.props.reportHeadersOutput}
        </div>
        <FormGroup bsSize="small" style={{marginLeft: "30px", width: "80%", position: "absolute", bottom: "0px"}}>
          <ControlLabel>
            <center><h4>Filter:</h4></center>
          </ControlLabel>
          <FormControl componentClass="select" placeholder="Status" onChange={this.filterByStatus}>
            <option value={null}>Status</option>
            <option value={null}>Correct</option>
            <option value={null}>Flagged</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Form" onChange={this.filterByForm}>
            <option value={null}>Form</option>
            <option value={null}>Retained</option>
            <option value={null}>Replaced</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Notes" onChange={this.filterByNotes}>
            <option value={null}>Notes</option>
            <option value={null}>With Notes</option>
            <option value={null}>Without Notes</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Proposed Changes" onChange={this.filterByStatus}>
            <option value={null}>Proposed Changes</option>
            <option value={null}>With Proposed Changes</option>
            <option value={null}>Without Proposed Changes</option>
          </FormControl>
          <br />
          <FormControl componentClass="select" placeholder="Chapter" onChange={this.filterByChapter}>
            <option value={null}>Chapter</option>
            {/*chapterArray*/}
          </FormControl>
          <InputGroup style={{marginTop:"65px"}}>
            <FormControl type="text" placeholder="Search"/>
            <InputGroup.Button>
              <Button><Glyphicon glyph="search" /></Button>
            </InputGroup.Button>
          </InputGroup>
          <br />
          <br />
          <center>
            <h5>{`Report for ${this.props.bookName} `}<br />
            <small>
              {"\n By " + this.props.authors + ", created on " + new Date().toDateString()}
            </small>
            </h5>
          </center>
        </FormGroup>
      </div>
    );
  }

  }

  module.exports = ReportSideBar;
