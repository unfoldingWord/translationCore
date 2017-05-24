
var style = {
  sideBarcontainer: {
    backgroundColor: "var(--background-color-dark)",
    zIndex: "98",
    fontSize: "12px",
    overflowX: "hidden",
    height: "100%",
    padding: 0,
    position:"fixed",
    width:"300px"
  },

  container: {
    backgroundColor: "var(--background-color-dark)",
    height: "100vh",
    display: "inline-block",
    zIndex: "99",
    fontSize: "12px",
    overflowY: "auto",
    width:"100%"
  },

  fixedChevrons: {
    zIndex: 1000,
    backgroundColor: 'var(--background-color-dark)',
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
    color: "var(--reverse-color)",
    cursor: "pointer",
    userSelect: "none",
  },

  glyphicon: {
    fontSize: "25px",
    color: "var(--reverse-color)",
  },

  glyphiconHover: {
    fontSize: "29px",
    color: "var(--accent-color-light)",
  },

  hover: {
    backgroundColor: "var(--background-color-dark)",
    color: "var(--accent-color)",
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
    cursor: "pointer",
  },

  img: {
    width: "25px",
    height: "30px",
  },

  StatusBar: {
    backgroundColor: "var(--background-color-dark)",
    height: "30px",
    width: "100%",
    fontSize: "16px",
    zIndex: "97",
  },

  slideButton: {
    float: "right",
    marginTop: "50vh",
    zIndex: "999",
    color: "var(--reverse-color)",
    backgroundColor: "var(--text-color-dark)",
    padding: "10px 0",
    marginRight: "-15px",
    borderRadius: "0 5px 5px 0"
  },

  slideButtonCollapsed: {
    float: "left",
    marginTop: "50vh",
    zIndex: "999",
    color: "var(--reverse-color)",
    backgroundColor: "var(--text-color-dark)",
    padding: "10px 0",
    marginRight: "-15px",
    borderRadius: "0 5px 5px 0"
  }

};

module.exports = style;
