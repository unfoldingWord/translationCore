import React from 'react';
import PropTypes from 'prop-types';

class Groups extends React.Component {

  constructor(props) {
    super(props);
    this.state = { groupsPaddingTop: 175 };
  }

  componentDidMount() {
    this.updateMenuDimensions();
    window.addEventListener('resize', this.updateMenuDimensions);
  }

  updateMenuDimensions() {
    const menuFilter = document.getElementById('groups-menu-filter');
    if (menuFilter) {
      const filterHeight = document.getElementById('groups-menu-filter').clientHeight;
      this.setState({ groupsPaddingTop: filterHeight });
    }
  }

  render() {
    const styles = {
      paddingTop: this.state.groupsPaddingTop,        
      color: "var(--reverse-color)", 
      width: "100%"
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
