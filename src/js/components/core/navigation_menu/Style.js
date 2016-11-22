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

  MenuHeaders: {
    display: "block",
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #747474"
  },

  subMenuChecks: {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    width: "100vw"
  },

  subMenuActiveCheck:  {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    width: "100vw",
    backgroundColor: "#4bc7ed",
  },

};

module.exports = style;
