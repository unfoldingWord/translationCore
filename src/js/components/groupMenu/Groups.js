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
    window.addEventListener('resize', this.updateMenuDimensions.bind(this));
  }

  updateMenuDimensions() {
    const menuTop = document.getElementById('groups-menu-top');
    if (menuTop) {
      const groupsTop = menuTop.clientHeight;
      this.setState({ groupsTop });
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
