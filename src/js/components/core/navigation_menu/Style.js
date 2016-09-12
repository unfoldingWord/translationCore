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
  }
};

module.exports = style;
