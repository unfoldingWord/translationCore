 var style = {
  menuItem: {
    text: {
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
