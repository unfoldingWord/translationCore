import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover/Popover';
import MenuItem from './MenuItem';

/**
 * Represents a popover menu
 */
export default class Menu extends React.Component {
  render () {
    const {
      open,
      anchorEl,
      style,
      anchorOrigin,
      transformOrigin,
      onClose,
      children
    } = this.props;

    const numChildren = React.Children.count(children);
    const formattedChildren = [];
    React.Children.map(children, (child, index)=> {
      formattedChildren.push(child);
      if(index < numChildren - 1) {
        formattedChildren.push(<hr />);
      }
    });
    return (
      <Popover open={open}
               anchorEl={anchorEl}
               style={style}
               anchorOrigin={anchorOrigin}
               targetOrigin={transformOrigin}
               onRequestClose={onClose}>
        <div style={{margin: '4px'}}>
          {children}
        </div>

      </Popover>
    );
  }
}
Menu.propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.any,
  style: PropTypes.object,
  transformOrigin: PropTypes.object,
  anchorOrigin: PropTypes.object,
  onClose: PropTypes.func,
  children: PropTypes.arrayOf(MenuItem)
};

exports.MenuItem = MenuItem;
