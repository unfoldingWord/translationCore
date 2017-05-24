var style = {
  ReportSideBar:{
    layout:{
      backgroundColor: "var(--background-color-dark)",
      width: "100%",
      height: "100%",
      margin: "0px",
      fontSize: "12px",
      color: "var(--reverse-color)",
    },
    FormGroup:{
      margin: "0px",
      width: "100%",
      padding: "15px",
    },
    FormControl:{
      backgroundColor: "var(--background-color-dark)",
      color: "var(--reverse-color)",
      width: "100%",
      float: "right",
    }
  },

  reportContainer:{
    backgroundColor: "var(--background-color-dark)",
    width: "100%",
    height: "100%",
    margin: "0px",
    display: "inline-block",
    fontSize: "12px",
    overflowX: "hidden",
    overflowY: "auto",
    padding: "15px 5px 5px 5px",
    border: "1px solid var(--border-color)",
  },

  hidePageGlyph:{
    color: "var(--warning-color)",
    cursor: "pointer",
    position: "fixed",
    fontSize: "18px",
    float: "right",
    right: "2px",
    top: "3px",
    zIndex: "101",
  },

  searchBox:{
    height: "34px",
    fontSize: "16px",
    width: "100%",
    borderRadius: "5px",
    backgroundColor: "var(--background-color)",
    color: "var(--reverse-color)",
    borderColor: "var(--border-color)",
  },


};

module.exports = style;
