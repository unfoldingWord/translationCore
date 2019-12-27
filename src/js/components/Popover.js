
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Divider } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';

class PopoverComponent extends Component {
  render() {
    let {
      popoverVisibility, title, bodyText, positionCoord, onClosePopover,
    } = this.props;

    return (
      <div>
        <Popover
          className='popover-root'
          style={{
            padding: '0.75em', maxWidth: '400px', backgroundColor: 'var(--background-color-light)',
          }}
          open={popoverVisibility}
          anchorEl={positionCoord}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={onClosePopover}
        >
          <div style={{
            display: 'flex', alignItems:'top', padding: 0,
          }}>
            <span style={{
              fontSize: '1.2em', fontWeight: 'bold', marginBottom: 10, marginTop: 0, paddingTop: 0,
            }}>
              {title}
            </span>
            <Glyphicon glyph={'remove'}
              style={{
                paddingTop: '5px',
                color: 'var(--text-color-light)',
                cursor: 'pointer',
                alignItems: 'top',
                marginLeft: 'auto', marginRight: 5,
              }}
              onClick={onClosePopover} />
          </div>
          <Divider />
          <span style={{ padding: '10px 0 15px 0' }}>
            {bodyText}
          </span>
        </Popover>
      </div>
    );
  }
}


PopoverComponent.propTypes = {
  popoverVisibility: PropTypes.any,
  title: PropTypes.any,
  bodyText: PropTypes.any,
  positionCoord: PropTypes.any,
  onClosePopover: PropTypes.func,
};

export default PopoverComponent;
