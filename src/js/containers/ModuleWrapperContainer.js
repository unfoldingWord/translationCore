const React = require('react');
const { connect } = require('react-redux');
const CoreStore = require('../stores/CoreStore.js');
const SwitchCheck = require('../components/core/SwitchCheck');
const RecentProjectsContainer = require('./RecentProjectsContainer');
const ToolsContainer = require('./ToolsContainer');


class ModuleWrapperContainer extends React.Component {
  render() {
    var mainContent;
    if (this.props.mainViewVisible) {
      switch (this.props.type) {
        case 'tools':
          mainContent = <SwitchCheck {...this.props.switchCheckProps} />;
          break;
        case 'recent':
          mainContent = <RecentProjectsContainer />;
          break;
        case 'main':
          mainContent = <ToolsContainer currentTool={this.props.mainTool}/>;
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
    return Object.assign({}, state);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        /*anyactionmethod: () => {
            dispatch(anyactions.anyactionmethod());
        }*/
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ModuleWrapperContainer);
