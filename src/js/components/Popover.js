import React, { Component } from 'react';
import { Popover, Divider } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';

export default class PopoverComponent extends Component {
  render() {
    let { popoverVisibility, title, bodyText, positionCoord, onClosePopover } = this.props;
    if (!popoverVisibility) {
      return (<div></div>);
    } else {
      return (
        <div>
          <Popover
            style={{ padding:0 , backgroundColor: "var(--background-color-light)" }}
            open={popoverVisibility}
            anchorEl={positionCoord}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            onRequestClose={onClosePopover}
          >
            <div style={{ display: 'flex', alignItems:'center', padding:'5px 0px' }}>
              <span style={{ marginLeft: 5 }}>
                {title}
              </span>
              <Glyphicon glyph={"remove"}
                style={{
                  color: "var(--text-color-light)",
                  cursor: 'pointer',alignItems: 'center',
                  marginLeft: 'auto', marginRight: 5
                }}
                onClick={onClosePopover} />
            </div>
            <Divider />
            <span style={{ padding: '0 20px' }}>
              {bodyText}
            </span>
          </Popover>
        </div>
      );
    }
  }
}
