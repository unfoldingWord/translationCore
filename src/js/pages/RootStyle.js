var RootStyles = {
  // TODO: Ideally, these scrollable sections should have relative positions.
  // This would allow us to use bootstrap properly and stop hard-coding component
  // sizes and offsets
  ScrollableSection: {
    height: '85%',
    position: 'fixed',
    overflowX: 'scroll',
    overflowY: 'scroll'
  },
  AfterCheck: {
    minWidth:'100vh',
    top: '90vh',
    height: 'auto',
    position: 'fixed',
    textAlign: 'center'
  }
};
module.exports = RootStyles;
