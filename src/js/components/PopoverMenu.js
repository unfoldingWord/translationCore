import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';

const makeStyles = (props, state) => {
  const { variant } = props;
  const { hover } = state;

  let buttonStyles = {};
  let iconStyles = {};

  if (variant === 'dark') {
    buttonStyles = {
      backgroundColor: 'transparent',
      border: 'solid 1px #ffffff',
      borderRadius: '5px',
      color: '#ffffff',
      fontSize: '12px',
      outline: 'none',
    };
    iconStyles = {
      width:15,
      height:15,
      color: '#ffffff',
    };

    if (hover) {
      buttonStyles = {
        ...buttonStyles,
        backgroundColor: '#ffffff',
        color: '#000000',
      };
      iconStyles = {
        ...iconStyles,
        color: '#000000',
      };
    }
  } else if (variant === 'primary') {
    iconStyles = { color: '#ffffff' };
  }

  return {
    icon: {
      verticalAlign: 'middle',
      marginRight: '5px',
      color: 'var(--accent-color-dark)',
      ...iconStyles,
    },
    button: buttonStyles,
  };
};

/**
 * Renders a standardized button with popover menu.
 * The purpose of this component is to make it easy to add a popover
 * menu with consistent form and functionality without a lot of boiler plate.
 *
 * @class
 *
 * @property {*} label - the label of the button
 * @property {bool} [open] - manually controls whether the popover is open or not.
 * @property {*} [icon] - the icon to display in the button
 * @property {string} [variant=secondary] - The style variant of the button.
 */
class PopoverMenu extends React.Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleRequestClose = this._handleRequestClose.bind(this);
    this._handleButtonOut = this._handleButtonOut.bind(this);
    this._handleButtonOver = this._handleButtonOver.bind(this);
    const { open } = props;

    this.state = {
      open: Boolean(open),
      hover: false,
    };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  /**
   * Handles clicks on the button that opens the menu
   * @private
   * @param {*} event
   */
  _handleClick(event) {
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  /**
   * Handles requests to close the menu
   * @private
   */
  _handleRequestClose() {
    this.setState({ open: false });
  }

  /**
   * Intercepts a click on the child
   * before calling the original listener
   * @private
   * @param {MenuItem} child - the menu item that was clicked
   */
  _hijackChildClick(child) {
    const closeMenu = this._handleRequestClose;

    return (event) => {
      closeMenu();

      if (child.props.onClick) {
        child.props.onClick(event);
      }
    };
  }

  /**
   * Enables hover state
   * @private
   */
  _handleButtonOver() {
    this.setState({ hover: true });
  }

  /**
   * Disables hover state
   * @private
   */
  _handleButtonOut() {
    this.setState({ hover: false });
  }

  render() {
    const {
      label, icon, variant, children,
    } = this.props;
    const { anchorEl, open } = this.state;

    let childrenWithAutoClose = React.Children.map(children, child =>
      React.cloneElement(child, { onClick: this._hijackChildClick(child) }));

    const styles = makeStyles(this.props, this.state);

    const iconCloned = icon && React.cloneElement(icon, {
      color: styles.icon.color,
      style: Object.assign(styles.icon, icon.props.style),
      key: 'iconCloned',
    });

    let buttonClassName = '';

    if (variant === 'primary') {
      buttonClassName = 'btn-prime';
    } else if (variant === 'secondary') {
      buttonClassName = 'btn-second';
    }

    return (
      <React.Fragment>
        <button onClick={this._handleClick}
          onMouseOver={this._handleButtonOver}
          onMouseOut={this._handleButtonOut}
          style={styles.button}
          className={buttonClassName}>
          {iconCloned}
          {label}
        </button>
        <Popover className='popover-root'
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this._handleRequestClose}>
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
  open: PropTypes.bool,
  icon: PropTypes.any,
  variant: PropTypes.string,
  children: PropTypes.any,
};
PopoverMenu.defaultProps = { variant: 'secondary' };

export default PopoverMenu;
