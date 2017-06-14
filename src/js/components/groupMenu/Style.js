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
        borderBottom: "1px solid var(--background-color)",
        fontWeight: 'normal',
        color: 'var(--reverse-color)'
      },
      current: {
        display: "block",
        paddingTop: "7px",
        paddingRight: '5px',
        paddingBottom: "10px",
        paddingLeft: '15px',
        cursor: "pointer",
        borderBottom: "1px solid var(--background-color)",
        backgroundColor: "var(--accent-color)",
        fontWeight: 'bold',
        color: 'var(--reverse-color)'
      }
    },
    statusIcon: {
      correct: {
        color: 'var(--completed-color)',
        display: 'initial',
        padding: '0 10px 0 20px'
      },
      comment: {
        color: 'var(--highlight-color)',
        display: 'initial',
        padding: '0 10px 0 20px'
      },
      verseEdit: {
        color: 'var(--reverse-color)',
        display: 'initial',
        padding: '0 10px 0 20px'
      },
      flagged: {
        color: 'var(--highlight-color)',
        display: 'initial'
      },
      unchecked: {
        display: 'none'
      },
      bookmark: {
        color: 'var(--reverse-color)',
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
    borderBottom: "1px solid var(--background-color-dark)",
    color: "var(--reverse-color)",
    backgroundColor: "var(--background-color)",
  },

  activeSubMenuItem:  {
    display: "block",
    padding: "10px 0",
    cursor: "pointer",
    borderBottom: "1px solid var(--background-color-dark)",
    color: "var(--reverse-color)",
    backgroundColor: "var(--accent-color)",
  },

};

module.exports = style;
