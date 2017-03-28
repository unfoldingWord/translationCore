import React from 'react';
import { connect } from 'react-redux';
import SwitchCheck from '../components/core/SwitchCheck';
import RecentProjectsContainer from './RecentProjectsContainer';
import ToolsContainer from './ToolsContainer';
import { selectModalTab } from '../actions/ModalActions.js';
import { loadTool } from '../actions/ToolsActions.js';

class ModuleWrapperContainer extends React.Component {
  render() {
    let { mainViewVisible, type, currentCheckNamespace, modules } = this.props;
    let mainTool = modules[currentCheckNamespace];
    let mainContent;
    if (mainViewVisible) {
      switch (type) {
        case 'tools':
          mainContent = <SwitchCheck {...this.props} />;
          break;
        case 'recent':
          mainContent = <RecentProjectsContainer />;
          break;
        case 'main':
          mainContent = <ToolsContainer currentTool={mainTool} />;
          break;
        default:
          mainContent = (<div> </div>);
          break;
      }
    }
    return (
      <div>
        {mainContent}
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return Object.assign({},
    state.coreStoreReducer,
    state.toolsReducer,
    state.settingsReducer,
    state.checkStoreReducer,
    state.loaderReducer,
    state.projectDetailsReducer
  );
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    showLoad: () => {
      dispatch(modalActions.selectModalTab(2))
    },
    handleLoadTool: (toolFolderPath) => {
      dispatch(loadTool(toolFolderPath));
    },
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ModuleWrapperContainer);
