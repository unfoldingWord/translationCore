var style = {
  layout:{
    backgroundColor: "#333333",
    width: "100%",
    height: "100vh",
    marginLeft: "0px",
    position: "fixed",
    zIndex: "100",
    left: "0px",
    fontSize: "12px",
    color: "white",
    overflowX: "hidden",
    overflowY: "auto",
    paddingRight: "20px",
  },

  ul: {
    margin: "0px",
    padding: "0px",
  },

  removeGlypcIcon:{
    color:"red",
    cursor: "pointer",
    position: "fixed",
    fontSize: "18px",
    float: "right",
    right: "5px",
    top: "5px",
    zIndex: "101",
  },

  cardLayout:{
    width: "55%",
    heigth: "115px",
    marginBottom: "10px",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
    backgroundColor: "#303337",
    overflow: "hidden",
    cursor: "pointer",
    boxSizing: "border-box",
    display: "block",
    float: "right",
  },

  cardLayoutHover:{
    width: "730px",
    heigth: "115px",
    marginBottom: "10px",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
    backgroundColor: "#aaaaaa",
    overflow: "hidden",
    cursor: "pointer",
    boxSizing: "border-box",
    display: "block",
  },

  sideBar:{
    backgroundColor: "#303337",
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
    color: "#aaaaaa",
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
    backgroundColor: "#767676",
    color: "white",
    borderRight: "1px solid rgba(0, 0, 0, 0.5)",
    borderLeft: "1px solid rgba(0, 0, 0, 0.5)",
  },

  header:{
    backgroundColor: "#333333",
    width:"100%",
    height: "125px",
    padding: "40px",
    position: "relative",
    marginRight: "-20px",
    marginBottom: "20px",
    fontSize: "14px",
    left: "181px",
    top: "0px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
  },

  heading:{
    fontSize: "18px",
    color: "white",
  },

  sideBarGlyph:{
    color: "#aaaaaa"
  },

  sideBarGlyphHover:{
    color: "white",
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


};

module.exports = style;
