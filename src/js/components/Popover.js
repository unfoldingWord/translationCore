
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Divider } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';

const defaultPopoverStyle = {
  padding: '0.75em', maxWidth: '400px', backgroundColor: 'var(--background-color-light)',
};

const defaultTitleStyle = {
  fontSize: '1.2em', fontWeight: 'bold', marginBottom: 10, marginTop: 0, paddingTop: 0,
};

const defaultBodyStyle = { padding: '10px 0 15px 0' };

/**
 * apply styles to defaultStyles
 * @param {object} style
 * @param {object} defaultStyle
 * @returns {*}
 */
function addStyles(style, defaultStyle) {
  let newStyle = defaultStyle;

  if (style && Object.keys(style)?.length) {
    newStyle = {
      ...defaultStyle,
      ...style,
    };
  }
  return newStyle;
}

class PopoverComponent extends Component {
  render() {
    let {
      popoverVisibility, title, bodyText, positionCoord, onClosePopover, style, titleStyle, bodyStyle,
    } = this.props;
    const style_ = addStyles(style, defaultPopoverStyle);
    const titleStyle_ = addStyles(titleStyle, defaultTitleStyle);
    const bodyStyle_ = addStyles(bodyStyle, defaultBodyStyle);

    return (
      <div>
        <Popover
          className='popover-root'
          style={style_}
          open={popoverVisibility}
          anchorEl={positionCoord}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={onClosePopover}
        >
          <div style={{
            display: 'flex', alignItems:'top', padding: 0,
          }}>
            <span style={titleStyle_}>
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
          <span style={bodyStyle_}>
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
  style: PropTypes.object,
  titleStyle: PropTypes.object,
  bodyStyle: PropTypes.object,
};

export default PopoverComponent;
