import React from 'react';
import PropTypes from 'prop-types';

class Groups extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      groupsTop: 250
    };
  }

  componentDidMount() {
    this.updateMenuDimensions();
    window.addEventListener('resize', this.updateMenuDimensions);
  }

  updateMenuDimensions() {
    const menuFilter = document.getElementById('groups-menu-filter');
    if (menuFilter) {
      const filterHeight = document.getElementById('groups-menu-filter').clientHeight;
      this.setState({ groupsTop: filterHeight });
    }
  }

  render() {
    const styles = {
      top: this.state.groupsTop,        
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
