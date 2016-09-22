const api = window.ModuleApi;
const React = api.React;


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
      overflowY: "auto", color: "white"}}>
        <center><h4>Translation Report</h4></center>

      </div>
    );
  }

  }

  module.exports = ReportSideBar;
