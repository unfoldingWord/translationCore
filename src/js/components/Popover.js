import React, {Component} from 'react';
import {Popover, Divider} from 'material-ui';

export default class PopoverComponent extends Component {
  render() {
    let {popoverVisibility, title, bodyText, positionCoord, onClosePopover} = this.props;
    if (!popoverVisibility) {
      return (<div></div>);
    } else {
      return (
        <div>
          <Popover
            style={{padding: '10px 0', backgroundColor: "var(--background-color-light)"}}
            open={popoverVisibility}
            anchorEl={positionCoord}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={onClosePopover}
          >
            <span style={{padding: '0 10px'}}>
              {title}
            </span>
            <Divider />
            <span style={{padding: '0 20px'}}>
              {bodyText}
            </span>
          </Popover>
        </div>
      );
    }
  }
}
