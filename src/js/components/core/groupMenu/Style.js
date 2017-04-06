 var style = {
  menuItem: {
    heading: {
      normal: {
        display: "block",
        paddingTop: "7px",
        paddingRight: '5px',
        paddingBottom: "10px",
        paddingLeft: '15px',
        cursor: "pointer",
        borderBottom: "1px solid #747474",
        cursor: 'pointer',
        fontWeight: 'normal',
        color: 'white'
      },
      current: {
        display: "block",
        paddingTop: "7px",
        paddingRight: '5px',
        paddingBottom: "10px",
        paddingLeft: '15px',
        cursor: "pointer",
        borderBottom: "1px solid #747474",
        backgroundColor: "#0277BD",
        fontWeight: 'bold',
        color: 'white'
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
      },
      bookmark: {
        color: '#FFFFFF',
        display: 'initial'
      }
    }
  },

  subMenuItem: {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
  },

  activeSubMenuItem:  {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    backgroundColor: "#0277BD",
  },

};

module.exports = style;
