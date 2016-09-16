var style = {
  pane: {
    content: {
      overflowY: 'scroll',
      width: '100%',
      height: '250px',
      direction: 'ltr'
    },
    header: {
      margin: '5px 0',
      width: '100%',
      color: '#44c6ff',
      fontWeight: 'bold',
      fontSize: '28px'
    },
    title: {
      fontWeight: '700',
      fontSize: '17px'
    }
  },
  dropzone: {
    active: {
      border: '2px solid #727272',
      backgroundColor: '#f5f5f5'
    },
    text: {
      lineHeight: '200px',
      verticalAlign: 'middle',
      width: '100%'
    },
    main: {
      width: '100%',
      color: '#212121',
      height: '200px',
      border: '2px dashed #727272',
      borderRadius: '5px',
      fontSize: '25px'
    }
  },
  menuItem: {
    text: {
      cursor: 'pointer'
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
};

module.exports = style;
