 var style = {
  menuItem: {
    text: {
      cursor: 'pointer'
    },
    current: {
      cursor: 'pointer',
      fontWeight: 'bold'
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
