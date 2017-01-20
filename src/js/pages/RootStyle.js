var RootStyles = {
  // ScrollableSection fills the screen and adds a scroll bar
  // For this to work, every single ancestor of the scrollable section
  // must have the class "fill-height"
  ScrollableSection: {
    height: '100%',
    position: 'relative',
    overflowY: 'scroll',
    bottom:0,
    paddingLeft:"0px",
    paddingRight: "0px"
  },
  AfterCheck: {
    minWidth:'100vh',
    top: '90vh',
    height: 'auto',
    position: 'fixed',
    textAlign: 'center'
  },
  WelcomeFrame: {
    backgroundColor: '#2ecc71',
    height: '100%'
  },
  WelcomePage: {
    width: '100%',
    margin: 'auto'
  }
};
module.exports = RootStyles;
