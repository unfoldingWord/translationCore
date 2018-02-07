import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

/**
 * Represents a generic popover menu
 */
export default class PopoverMenu extends React.Component {

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.state = {
      open: false
    };
  }

  handleClick(event) {
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestClose() {
    this.setState({
      open: false
    });
  }

  /**
   * Intercepts a click on the child
   * before calling the original listener
   */
  hijackChildClick(child) {
    const closeMenu = this.handleRequestClose;
    return (event) => {
      closeMenu();
      if(child.onClick) {
        child.onClick(event);
      }
    };
  }

  render () {
    const {label, icon, primary, children} = this.props;
    const {anchorEl, open} = this.state;

    let childrenWithAutoClose = React.Children.map(children, child =>
      React.cloneElement(child, {onClick: this.hijackChildClick(child)}));

    const styles = {
      icon: {
        verticalAlign: 'middle',
        marginRight: '5px'
      }
    };

    const iconCloned = icon && React.cloneElement(icon, {
      color: primary ? '#ffffff' : 'var(--accent-color-dark)',
      style: Object.assign(styles.icon, icon.props.style),
      key: 'iconCloned'
    });

    return (
      <React.Fragment>
        <button onClick={this.handleClick}
                className={primary ? "btn-prime" : "btn-second"}>
          {iconCloned}
          {label}
        </button>
        <Popover className='popover-root'
                 open={open}
                 anchorEl={anchorEl}
                 anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                 targetOrigin={{horizontal: 'left', vertical: 'top'}}
                 onRequestClose={this.handleRequestClose}>
          <Menu>
            {childrenWithAutoClose}
          </Menu>
        </Popover>
      </React.Fragment>
    );
  }
}
PopoverMenu.propTypes = {
  label: PropTypes.any.isRequired,
  icon: PropTypes.any,
  primary: PropTypes.bool,
  children: PropTypes.any
};

exports.MenuItem = MenuItem;
