import React from 'react';
import PropTypes from 'prop-types';

class GroupsMenuFilterOption extends React.Component {

  handleCheckboxSelection(event) {
    const value = event.target.checked;
    this.props.setFilter(this.props.name, value);
  }

  handleCheckboxToggle() {
    if (! this.props.disabled)
      this.props.setFilter(this.props.name, !this.props.checked);
  }

  render() {
    const {
      name,
      text,
      icon,
      checked,
      disabled
    } = this.props;
    return (
      <div className={"option"+(disabled?" disabled":"")}>
        <span className="option-checkbox">
          <input type="checkbox" name={name} checked={checked} disabled={disabled} onChange={this.handleCheckboxSelection.bind(this)} />
        </span>
        <span className="option-icon" onClick={this.handleCheckboxToggle.bind(this)}>
          {icon}
        </span>
        <span className="option-text" onClick={this.handleCheckboxToggle.bind(this)}>
          {text}
        </span>
      </div>
    );
  }
}

GroupsMenuFilterOption.defaultProps = {
  checked: false,
  disabled: false
};

GroupsMenuFilterOption.propTypes = {
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool
};

export default GroupsMenuFilterOption;
