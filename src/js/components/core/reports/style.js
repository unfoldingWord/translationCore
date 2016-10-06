var style = {
  ReportSideBar:{
    layout:{
      backgroundColor: "#333333",
      width: "25%",
      height: "100vh",
      marginLeft: "0px",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      fontSize: "12px",
      color: "white",
      overflowX: "hidden",
      overflowY: "auto",
      border: "1px solid rgba(0, 0, 0, 0.5)",
    },
    FormGroup:{
      marginLeft: "30px",
      width: "80%",
      bottom: "0px",
    },
  },

  reportContainer:{
    backgroundColor: "#333333",
    width: "88.5%",
    height: "100vh",
    marginLeft: "0px",
    display: "inline-block",
    position: "fixed",
    zIndex: "99",
    left: "25%",
    fontSize: "12px",
    overflowX: "hidden",
    overflowY: "scroll",
  },

  reportHeader:{
    width: "100%",
    height: "20px",
    backgroundColor:"#333333",
    position: "fixed",
    zIndex: "100",
  },

  hidePageGlyph:{
    color:"red",
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
    width: "128%",
    borderRadius: "5px",
  },


};

module.exports = style;
