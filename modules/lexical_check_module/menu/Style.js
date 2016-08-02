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
        display: 'initial'
      },
      replaced: {
        color: 'gold',
        display: 'initial'
      },
      wrong: {
        color: 'red',
        display: 'initial'
      },
      unchecked: {
        display: 'none'
      }
    }
  }
};

module.exports = style;
