var RootStyles = {
  // ScrollableSection fills the screen and adds a scroll bar
  // For this to work, every single ancestor of the scrollable section
  // must have the class "fill-height"
  ScrollableSection: {
    height: '100%',
    position: 'relative',
    top: '0px',
    bottom: 0,
    overflowY: 'scroll' 
  },
  AfterCheck: {
    minWidth:'100vh',
    top: '90vh',
    height: 'auto',
    position: 'fixed',
    textAlign: 'center',
  }
};
module.exports = RootStyles;
