const React = require('react');
const CoreActions = require('../../actions/CoreActions.js');
const CoreStore = require('../../stores/CoreStore.js');
const Popover = require('react-bootstrap/lib/Popover');

class PopoverComponent extends React.Component{
  constructor(){
    super();
    this.state = {
      visibility: false,
      body: '',
      title: '',
      left: 0,
      top: 0
    }
    this.updatePopoverVisibility = this.updatePopoverVisibility.bind(this);
  }

  componentWillMount() {
    CoreActions.updatePopover(false, '', '');
    CoreStore.addChangeListener(this.updatePopoverVisibility);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updatePopoverVisibility);
  }

  updatePopoverVisibility(){
    this.setState(CoreStore.getPopoverVisibility());
  }

  hideNotification(){
    CoreActions.updatePopover(false, '', '', 0, 0);
  }

  render(){
    if (this.state.visibility) {
      return(
        <Popover
               id="popoverDisplay"
               rootClose
               placement="bottom"
               positionLeft={this.state.left}
               positionTop={this.state.top}
               arrowOffsetLeft={-1000}
               arrowOffsetTop={-1000}
               title={<span>{this.state.title}
                        <span className={"pull-right"} onClick={() => {
                          this.hideNotification();
                        }} style={{marginLeft: '20px', cursor: 'pointer'}}>x</span></span>}>
                  {this.state.body}
               </Popover>
      );
    } else {
      return (<div></div>);
    }
    }
}

module.exports = PopoverComponent;
