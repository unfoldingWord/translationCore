var style = {
  sideBarcontainer:{
      backgroundColor: "#333333",
      width: "120px",
      height: "100vh",
      marginLeft: "0px",
      position: "fixed",
      zIndex: "98",
      left: "0px",
      fontSize: "12px",
      overflowY: "initial",
      boxSizing: "border-box",
  },

  container:{
      backgroundColor: "#333333",
      width: "120px",
      height: "100vh",
      marginLeft: "0px",
      display: "inline-block",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      fontSize: "12px",
      overflowY: "auto",

  },

  ul: {
    margin: "0px",
    padding: "0px",
  },

  li: {
    display: "block",
    textAlign: "center",
    paddingTop: "15px",
    paddingBottom: "15px",
    color: "white",
    cursor: "pointer",
    userSelect: "none",
  },

  glyphicon: {
    fontSize: "25px",
    color: "white",
  },

  glyphiconHover: {
    fontSize: "29px",
    color: "#44C6FF",
  },

  hover: {
    backgroundColor: "#444444",
    color: "#44C6FF",
    cursor: "pointer",
    display: "block",
    textAlign: "center",
    userSelect: "none",
    paddingTop: "13px",
    paddingBottom: "13px"

  },

  logo:{
    height: "85px",
    width: "80px",
    display: "block",
    padding: "5px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "5px",
  },

  textOffline:{
    float: "right",
    color: "#FF0000",
    padding: "5px",
    marginRight: "15px",
  },

  textOnline:{
    position: "fixed",
    right: "0px",
    color: "#00B233",
    padding: "5px",
    marginRight: "15px",
  },

  img:{
    width: "25px",
    height: "30px",
  },

  StatusBar:{
    position: "fixed",
    top: "0px",
    backgroundColor: "#333333",
    height: "30px",
    width: "100%",
    fontSize: "16px",
    zIndex: "97",
  },

};

module.exports = style;
