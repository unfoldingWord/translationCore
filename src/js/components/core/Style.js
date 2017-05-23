 var style = {
  menuItem: {
    text: {
      cursor: 'pointer'
    },
    flag: {
      enabled: {
        color: 'var(--warning-color)',
        visibility: 'visible'
      },
      disabled: {
        visibility: 'hidden'
      }
    },
    statusIcon: {
      correct: {
        color: 'var(--completed-color)',
        display: 'initial'
      },
      replaced: {
        color: 'var(--highlight-color)',
        display: 'initial'
      },
      flagged: {
        color: 'var(--warning-color)',
        display: 'initial'
      },
      unchecked: {
        display: 'none'
      }
    }
  },
};

module.exports = style;
