import React from 'react'
import { connect } from 'react-redux'
import SwitchCheck from '../components/core/SwitchCheck'
import RecentProjectsContainer from './RecentProjectsContainer'
import ToolsContainer from './ToolsContainer'
import modalActions from '../actions/modalActions.js'
import ToolsActions from '../actions/ToolsActions.js'
const api = window.ModuleApi;

class ModuleWrapperContainer extends React.Component {
  render() {
    let { mainViewVisible, type, currentCheckNameSpace, onGetModule } = this.props;
    let mainTool = onGetModule(currentCheckNameSpace);
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
          mainContent = <ToolsContainer currentTool={mainTool}/>;
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


function mapStateToProps(state) {
    return Object.assign({},
      state.coreStoreReducer,
      state.toolsReducer,
      state.settingsReducer,
      state.checkStoreReducer
    );
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      showLoad: () => {
        dispatch(modalActions.selectModalTab(2))
      },
      handleLoadTool: (toolFolderPath) => {
        dispatch(ToolsActions.loadTool(toolFolderPath));
      },
      onGetModule: (currentCheckNameSpace) => {
        //we need to make this  redux action 
        return api.getModule(currentCheckNameSpace);
      }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ModuleWrapperContainer);
