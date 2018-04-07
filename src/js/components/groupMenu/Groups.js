import React from 'react';
import PropTypes from 'prop-types';

class Groups extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      groupsTop: 250
    };
  }

  componentDidUpdate() {
    // We want to make sure this Groups component is positioned below the menu top correctly
    // when this is updated since the top can be of varilable size (e.g. filter list is collapsed).
    const menuTop = document.getElementById('groups-menu-top');
    if (menuTop && this.state.groupsTop != menuTop.clientHeight) {
      // renders only if height of menu top has changed.
      this.setState({ groupsTop:  menuTop.clientHeight });
    }
  }

  render() {
    const styles = {
      top: this.state.groupsTop, // determined from the groups-filter height
    };

    return (
      <div id="groups" style={styles}>
        {this.props.groups}
      </div>
    );
  }
}

Groups.propTypes = {
    groups: PropTypes.any.isRequired
};

export default Groups;
