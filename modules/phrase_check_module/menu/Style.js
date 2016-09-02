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
      retained: {
        color: 'green',
        visibility: 'visible'
      },
      replaced: {
        color: 'gold',
        visibility: 'visible'
      },
      wrong: {
        color: 'red',
        visibility: 'visible'
      },
      unchecked: {
        visibility: 'hidden'
      }
    }
  },
};

module.exports = style;
