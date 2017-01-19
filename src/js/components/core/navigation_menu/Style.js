 var style = {
  menuItem: {
    text: {
      normal: {
        cursor: 'pointer',
        fontWeight: 'normal',
        paddingLeft: '15px',
        paddingRight: '5px'
      },
      current: {
        cursor: 'pointer',
        fontWeight: 'bold',
        paddingLeft: '15px',
        paddingRight: '5px'
      }
    },
    statusIcon: {
      correct: {
        color: '#4EBA67',
        display: 'initial'
      },
      flagged: {
        color: '#FDD910',
        display: 'initial'
      },
      unchecked: {
        display: 'none'
      }
    }
  },

  menuHeader: {
    display: "block",
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #747474"
  },

  activeMenuHeader: {
    display: "block",
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #747474",
    backgroundColor: "#0277BD",
  },

  subMenuItem: {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    width: "100vw"
  },

  activeSubMenuItem:  {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    width: "100vw",
    backgroundColor: "#0277BD",
  },

};

module.exports = style;
