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
      retained: {
        color: 'green',
        display: 'initial'
      },
      replaced: {
        color: 'gold',
        display: 'initial'
      },
      flagged: {
        color: 'red',
        display: 'initial'
      },
      unchecked: {
        display: 'none'
      }
    }
  },

  subMenuChecks: {
    display: "block",
    padding: "10px 10px 10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #333333",
    color: "#FFF",
    width: "100vw"
  }

};

module.exports = style;
