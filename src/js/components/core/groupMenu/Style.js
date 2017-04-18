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
        display: 'initial',
        padding: '0 10px 0 20px'
      },
      comment: {
        color: '#f9c000',
        display: 'initial',
        padding: '0 10px 0 20px'
      },
      verseEdit: {
        color: '#FFFFFF',
        display: 'initial',
        padding: '0 10px 0 20px'
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
        display: 'initial',
        padding: '0 10px 0 20px'
      },
      blank: {
        display: 'initial',
        color: 'none',
        padding: '0 25px 0 20px'
      }
    }
  },

  subMenuItem: {
    display: "block",
    padding: "10px 0",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    backgroundColor: "#666666",
  },

  activeSubMenuItem:  {
    display: "block",
    padding: "10px 0",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    backgroundColor: "#0277BD",
  },

};

module.exports = style;
