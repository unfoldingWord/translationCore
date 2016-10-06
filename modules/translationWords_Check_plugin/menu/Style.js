 var style = {
  menuItem: {
    text: {
      cursor: 'pointer',
      color: "#FFFFFF",
    },
    current: {
      cursor: 'pointer',
      fontWeight: 'bold',
      color: "#fdd910",
    },
    flag: {
      enabled: {
        color: '#CC0000',
        visibility: 'visible'
      },
      disabled: {
        visibility: 'hidden'
      }
    },
    statusIcon: {
      correct: {
        color: 'green',
        visibility: 'visible'
      },
      flagged: {
        color: 'red',
        visibility: 'visible'
      },
      unchecked: {
        visibility: 'hidden'
      }
    }
  }
};

module.exports = style;
