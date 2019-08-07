import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// components
import Popover from '../components/Popover';
// actions
import { closePopover } from '../actions/PopoverActions';

class PopoverContainer extends React.Component {
  shouldComponentUpdate(nextProps) {
    const {loadingProject} = nextProps.reducers.homeScreenReducer;
    if (loadingProject === true) {
      console.log('Prevented PopoverContainer loading re-render');
      return false;
    } else return true;
  }
  componentDidMount() {
    window.addEventListener('keydown', this.onEscapeKeyPressed.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onEscapeKeyPressed.bind(this));
  }

  onEscapeKeyPressed(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.props.onClosePopover();
    }
  }

  render() {
    return (
      <div>
        <Popover {...this.props}/>
      </div>
    );
  }
}

PopoverContainer.propTypes = {
  onClosePopover: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    ...state.popoverReducer,
    reducers: {
      homeScreenReducer: state.homeScreenReducer
    },
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClosePopover: () => {
      dispatch(closePopover());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopoverContainer);
