var style = {
  layout:{
    backgroundColor: "var(--background-color-dark)",
    width: "100%",
    height: "100vh",
    marginLeft: "0px",
    position: "fixed",
    zIndex: "100",
    left: "0px",
    fontSize: "12px",
    color: "var(--reverse-color)",
    overflowX: "hidden",
    overflowY: "scroll",
    paddingRight: "25px",
  },

  ul: {
    margin: "0px",
    padding: "0px",
  },

  removeGlypcIcon:{
    color: "var(--warning-color)",
    cursor: "pointer",
    position: "fixed",
    fontSize: "18px",
    float: "right",
    right: "22px",
    top: "10px",
    zIndex: "101",
  },

  cardLayout:{
    width: "55%",
    heigth: "115px",
    marginBottom: "10px",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
    backgroundColor: "var(--background-color-dark)",
    overflow: "hidden",
    boxSizing: "border-box",
    display: "block",
    marginLeft: "200px",
  },

  cardLayoutHover:{
    width: "730px",
    heigth: "115px",
    marginBottom: "10px",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
    backgroundColor: "var(--border-color)",
    overflow: "hidden",
    cursor: "pointer",
    boxSizing: "border-box",
    display: "block",
  },

  sideBar:{
    backgroundColor: "var(--background-color-dark)",
    width: "180px",
    height: "100vh",
    marginLeft: "0px",
    paddingTop: "15px",
    position: "fixed",
    left: "2px",
    top: "2px",
    overflowX: "hidden",
    overflowY: "auto",
    border: "1px solid rgba(0, 0, 0, 0.5)",
    color: "var(--border-color)",
  },

  sideBarButton:{
    width: "100%",
    height: "40px",
    fontSize: "14px",
    boxSizing: "border-box",
    padding: "10px 15px",
    position: "relative",
    cursor: "pointer",
  },

  sideBarButtonHover:{
    width: "100%",
    height: "40px",
    fontSize: "14px",
    boxSizing: "border-box",
    padding: "10px 13px",
    position: "relative",
    cursor: "pointer",
    backgroundColor: "var(--accent-color-light)",
    color: "var(--reverse-color)",
    borderRight: "1px solid rgba(0, 0, 0, 0.5)",
    borderLeft: "1px solid rgba(0, 0, 0, 0.5)",
  },

  header:{
    backgroundColor: "var(--background-color-dark)",
    width:"100%",
    height: "125px",
    padding: "40px 180px 40px 18px",
    position: "relative",
    marginRight: "-20px",
    marginBottom: "20px",
    fontSize: "14px",
    left: "181px",
    top: "2px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
  },

  heading:{
    fontSize: "18px",
    color: "var(--reverse-color)",
  },

  sideBarGlyph:{
    color: "var(--border-color)"
  },

  sideBarGlyphHover:{
    color: "var(--reverse-color)",
  },

  imgSize:{
    width: "16px",
    height: "18px",
  },

  tcLogo:{
    height: "20px",
    width: "18px",
    marginLeft: "15px",
  },

  cardBody:{
    color: "var(--border-color)",
    fontSize: "16px",
  },

  versionText:{
    fontSize: "12px",
    fontWeight: "normal",
    color: "var(--border-color)",
  },

  packIcon:{
    borderRadius: "2px",
    height: "34px",
    width: "34px",
    display: "inline-block",
    verticalAlign: "middle",
  },

  packCardButton:{
    color: "var(--reverse-color)",
    backgroundColor: "var(--accent-color)",
    backgroundImage: "-webkit-linear-gradient(var(--accent-color), var(--accent-color))",
    borderColor: "var(--accent-color)",
  },

};

module.exports = style;
