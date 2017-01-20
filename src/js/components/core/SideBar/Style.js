const MENU_WIDTH = "200px";
var style = {
  sideBarcontainer:{
      backgroundColor: "#333333",
      width: MENU_WIDTH,
      height: "100vh",
      marginLeft: "0px",
      position: "fixed",
      zIndex: "98",
      left: "0px",
      fontSize: "12px",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
  },

  container:{
      backgroundColor: "#333333",
      width: MENU_WIDTH,
      height: "100vh",
      marginLeft: "0px",
      display: "inline-block",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      fontSize: "12px",
      overflowY: "auto",
  },

  fixedChevrons: {
    zIndex: 1000,
    position: 'fixed',
    backgroundColor: '#333333'
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
    color: "#0277BD",
    cursor: "pointer",
    display: "block",
    textAlign: "center",
    userSelect: "none",
    paddingTop: "13px",
    paddingBottom: "13px"

  },

  logo:{
    height: "90px",
    width: "90px",
    display: "block",
    padding: "10px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  textOffline:{
    float: "right",
    color: "#FF0000",
    padding: "3px",
    marginRight: "15px",
    display: "inline",
  },

  textOnline:{
    float: "right",
    color: "#4eba6f",
    padding: "3px",
    marginRight: "15px",
    display: "inline",
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
    boxSizing: "border-box",
    display: "inline",
  },

};

module.exports = style;
