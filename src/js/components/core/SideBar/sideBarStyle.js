var style = {
  container:{
      backgroundColor: "#222",
      width: "85px",
      height: "100vh",
      marginLeft: "0px",
      display: "inline-block",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      fontSize: "12px",
      overflowY: "scroll",
  },

  ul: {
      margin: "0px",
      padding: "0px",
  },

  li: {
    display: "block",
    textAlign: "center",
    borderBottom: "2px solid #1E1D1F",
    paddingTop: "20px",
    paddingBottom: "20px",
    color: "white",
    cursor: "pointer",

    ':hover': {
      backgroundColor: 'red'
    },
  },

  glyphicon: {
    fontSize: "30px",
    color: "white",
  },

  glyphiconHover: {
    fontSize: "30px",
    color: "#a4c639",
  },

  hover: {
    backgroundColor: "#2b2b2b",
    color: "#a4c639",
    display: "block",
    textAlign: "center",
    borderBottom: "2px solid #1E1D1F",
    paddingTop: "20px",
    paddingBottom: "20px",
  },


};

module.exports = style;
