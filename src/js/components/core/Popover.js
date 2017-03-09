import React, { Component } from 'react'
import { Popover } from 'react-bootstrap'

class PopoverComponent extends Component{
  render(){
    let { popoverVisibility, title, bodyText, positionCoord, onClosePopover } = this.props;
    let x = positionCoord[0],
        y = positionCoord[1];
    if (!popoverVisibility) {
      return (<div></div>);
    } else {
      return(
        <Popover
          id="popoverDisplay"
          placement="bottom"
          positionLeft={x}
          positionTop={y}
          arrowOffsetLeft={-1000}
          arrowOffsetTop={-1000}
          title={<span>
                  {title}
                  <span
                    className={"pull-right"}
                    onClick={onClosePopover}
                    style={{marginLeft: '20px', cursor: 'pointer'}}>
                    x
                  </span>
                </span>}>
          {bodyText}
        </Popover>
      );
    }
  }
}

module.exports = PopoverComponent;
