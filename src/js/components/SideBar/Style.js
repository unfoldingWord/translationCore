
var style = {
  container: {
    backgroundColor: "var(--background-color-dark)",
    height: "100vh",
    display: "inline-block",
    zIndex: "99",
    fontSize: "12px",
    overflowY: "auto",
    width:"100%",
    overflowX:'hidden'
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

};

module.exports = style;
