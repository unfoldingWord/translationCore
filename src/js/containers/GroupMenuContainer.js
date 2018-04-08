/* eslint-disable react/no-find-dom-node */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Grid, Col, Glyphicon } from 'react-bootstrap';
import * as style from '../components/groupMenu/Style';
// components
import GroupsMenuFilter from '../components/groupMenu/GroupsMenuFilter';
import Groups from '../components/groupMenu/Groups';
import Group from '../components/groupMenu/Group';
import GroupItem from '../components/groupMenu/GroupItem';
// actions
import { changeCurrentContextId } from '../actions/ContextIdActions.js';
import { expandSubMenu } from '../actions/GroupMenuActions.js';
import * as CheckDataLoadActions from '../actions/CheckDataLoadActions';
//helpers
import * as ProjectDetailsHelpers from '../helpers/ProjectDetailsHelpers';
import isEqual from 'deep-equal';
import * as statusBadgeHelpers from '../helpers/statusBadgeHelpers';

const MENU_BAR_HEIGHT = 30;
const MENU_ITEM_HEIGHT = 38;

const groupMenuContainerStyle = {
  backgroundColor: "var(--background-color-dark)",
  zIndex: "98",
  fontSize: "12px",
  overflowX: "hidden",
  height: "100%",
  padding: 0,
  position: "fixed",
  width: "250px"
};

// Use named export for unconnected component (for tests)
export class GroupMenuContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showInvalidated: false,
      showBookmarks: false,
      showSelections: false,
      showNoSelections: false,
      showVerseEdits: false,
      showComments: false,
      expandFilter: false
    };
  }

  setFilter(name, value) {
    this.setState({[name]: value});
    if (name == 'showSelections' && value) {
      this.setState({showNoSelections: false});
    }
    if (name == 'showNoSelections' && value) {
      this.setState({showSelections: false});
    }
  }

  handleFilterToggle() {
    this.setState({expandFilter: !this.state.expandFilter});
  }

  menu() {
    const { translate, toolsReducer: {currentToolName} } = this.props;
    let menu = <div />;
    if (currentToolName !== null) {
      const filterCount = this.countFilters();      
      menu = (
        <div id="groups-menu-container">
          <div id="groups-menu-top">
            <div id="groups-menu-header">
              <span id="groups-menu-title">
                {this.props.translate('tools.menu')}
              </span>
              { currentToolName==="translationWords" ?
                <Glyphicon
                  key="filter"
                  glyph="filter"
                  className={'filter-icon '+(this.state.expandFilter?'expanded':'collapsed')}
                  onClick={this.handleFilterToggle.bind(this)} />
              :''}
              {!this.state.expandFilter && filterCount?<span className="filter-badge badge" onClick={this.handleFilterToggle.bind(this)}>{filterCount}</span>:""}
              </div>
            {currentToolName==="translationWords"?
              <GroupsMenuFilter
                {...this.state}
                currentToolName={currentToolName}
                translate={translate}
                setFilter={this.setFilter.bind(this)} />
              :''}
          </div>
          <Groups groups={this.groups()} />
        </div>
      );
    }
    return menu;
  }

  /**
  * @description - Tests if the the two elements are in the scope of the window (scroll bar)
  * The consts MENU_BAR_HEIGHT & MENU_ITEM_HEIGHT are set to account for the static window avialablity
  * @param {object} groupMenu - The current group menu header that is extended/actived (i.e. Metaphors)
  * @param {object} currentItem - The current group check item that is active (i.e. Luke 1:1)
  */
  inView(groupMenu, currentItem) {
    var rectGroup = ReactDOM.findDOMNode(groupMenu).getBoundingClientRect();
    var rectItem = ReactDOM.findDOMNode(currentItem).getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return Math.abs(rectGroup.top - rectItem.top) + MENU_BAR_HEIGHT + MENU_ITEM_HEIGHT <= viewHeight;
  }

  getGroupData(groupsData, groupId) {
    let groupData;
    if (groupsData !== undefined) {
      groupData = groupsData[groupId];
    }
    return groupData;
  }

  /**
  * @description generates the total progress for the group.
  * @return {Number} - progress percentage.
  */
  generateProgress(groupIndex) {
    let { groupsData } = this.props.groupsDataReducer;
    let groupId = groupIndex.id;
    let totalChecks = groupsData[groupId].length;
    let doneChecks = 0;

    groupsData[groupId].forEach(function (groupData) {
      if (groupData.selections && !groupData.reminders) {
        doneChecks++;
      }
    }, this);

    let progress = doneChecks / totalChecks;

    return progress;
  }

  /**
  * @description gets the group data for the groupItem.
  * @return {object} groud data object.
  */
  getItemGroupData(contextId, groupIndex) {
    let { groupsData } = this.props.groupsDataReducer;
    let groupId = groupIndex.id;

    let groupData = groupsData[groupId].filter(groupData => {
      return isEqual(groupData.contextId, contextId);
    });

    return groupData[0];
  }

  /**
   * @description - gets the status badge component for the group menu row
   * @param {object} groupItemData 
   */
  getStatusBadge(groupItemData) {
    if (!groupItemData || ! groupItemData.contextId)
    console.log(groupItemData);
    const { chapter, verse } = groupItemData.contextId.reference;
    const { alignmentData } = this.props.wordAlignmentReducer;
    const wordBank = alignmentData && alignmentData[chapter] && alignmentData[chapter][verse] ? alignmentData[chapter][verse].wordBank : [];
    const { currentToolName } = this.props.toolsReducer;
    const glyphs = [];

    // The below ifs are in order of precedence of the status badges we show
    // TODO: groupItemData should have an `invalidated` boolean when invalidation is done for all verses in #3086
    if (groupItemData.invalidated) glyphs.push('invalidated');
    if (groupItemData.reminders)   glyphs.push('bookmark');
    if (groupItemData.selections || (currentToolName === 'wordAlignment' && wordBank && wordBank.length === 0))
      glyphs.push('ok');
    if (groupItemData.verseEdits)  glyphs.push('pencil');
    if (groupItemData.comments)    glyphs.push('comment');
      
    return statusBadgeHelpers.getStatusBadge(glyphs);
  }

  scrollIntoView(element) {
    ReactDOM.findDOMNode(element).scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  /**
   * @description - Determines if the item should be shown in the group menu based on filters
   * @param {object} groupItemData 
   * @returns {boolean}
   */
  showGroupItem(groupItemData) {
    const {
      showInvalidated,
      showBookmarks,
      showSelections,
      showNoSelections,
      showVerseEdits,
      showComments
    } = this.state;
    return (! this.countFilters() ||
      ((showInvalidated && groupItemData.invalidated) 
        || (showBookmarks && groupItemData.reminders)
        || (showSelections && groupItemData.selections)
        || (showNoSelections && ! groupItemData.selections)
        || (showVerseEdits && groupItemData.verseEdits)
        || (showComments && groupItemData.comments)
      ));
  }

  /**
   * @description - Determines if the group should be shown in the group menu based on filters
   * @param {object} groupData
   * @returns {boolean}
   */
  showGroup(groupData) {
    if (! this.countFilters()) {
      return true;
    }
    for (let groupItemData of groupData) {
      if (this.showGroupItem(groupItemData)) {
        return true;
      }
    }
    return false;
  }

  countFilters() {
    const { showInvalidated, showBookmarks, showSelections, showNoSelections, showVerseEdits, showComments } = this.state;
    return [showInvalidated, showBookmarks, showSelections, showNoSelections, showVerseEdits, showComments].filter(k=>k).length;
  }

  /**
  * @description Maps all groupData aka check objects to GroupItem components
  * @param {array} groupData - array of all groupData objects
  * @param {object} groupIndex
  * @param {object} groupHeaderComponent
  * @return {array} groupItems - array of groupData mapped to GroupItem components
  */
  getGroupItemComponents(groupData, groupIndex, groupHeaderComponent) {
    const contextIdReducer = {...this.props.contextIdReducer};
    const projectDetailsReducer = {...this.props.projectDetailsReducer};
    const { manifest } = this.props.projectDetailsReducer;
    const items = [];
    let index = 0;
    for (let groupItemData of groupData) {
      if (! this.showGroupItem(groupItemData)) {
        continue;
      }
      contextIdReducer.contextId = groupItemData.contextId;
      let loadPath = CheckDataLoadActions.generateLoadPath(projectDetailsReducer, contextIdReducer, 'selections');
      let selectionsObject = CheckDataLoadActions.loadCheckData(loadPath, groupItemData.contextId);
      let selectionsArray = [];

      if (selectionsObject) {
        selectionsObject.selections.forEach((selection) => {
          selectionsArray.push(selection.text);
        });
      }
      let selections = selectionsArray.join(" ");

      let active = isEqual(groupItemData.contextId, this.props.contextIdReducer.contextId);
      let useTargetLanguageBookName = manifest.target_language && manifest.target_language.book && manifest.target_language.book.name;
      let bookName = useTargetLanguageBookName ? manifest.target_language.book.name : manifest.project.name;

      if (selections) {
        // Convert the book name to the abbreviation tit -> Tit
        let bookAbbr = manifest.project.id;
        bookName = bookAbbr.charAt(0).toUpperCase() + bookAbbr.slice(1);
      }

      items.push(
        <GroupItem
          key={index}
          {...this.props}
          {...groupItemData}
          statusBadge={this.getStatusBadge(groupItemData)}
          groupMenuHeader={groupHeaderComponent}
          scrollIntoView={this.scrollIntoView.bind(this)}
          active={active}
          bookName={bookName}
          selectionText={selections}
          inView={this.inView}
        />
      );
      index++;
    }
    return items;
  }

  /**
  * @description converts groupsIndex into array of Group components
  * @param {array} groupsIndex - array of all groupIndex objects
  * @return {array} groups - array of Group components
  */
  groups() {
    let { groupsIndex } = this.props.groupsIndexReducer;
    let groupComponents = (<div className='no-results'>{this.props.translate('tools.no_results')}</div>);
    let { groupsData } = this.props.groupsDataReducer;
    let { projectSaveLocation } = this.props.projectDetailsReducer;
    let progress;

    if (groupsIndex !== undefined) {
      groupsIndex = groupsIndex.filter(groupIndex => {
        return groupsData !== undefined && Object.keys(groupsData).includes(groupIndex.id) && this.showGroup(this.getGroupData(groupsData, groupIndex.id));
      });
      if (groupsIndex.length) {
        groupComponents = groupsIndex.map(groupIndex => {
          let { contextId } = this.props.contextIdReducer;
          let groupId = groupIndex.id;
          let currentGroupData = this.getGroupData(groupsData, groupId);
          let active = false;
          
          if (contextId !== null) {
            active = contextId.groupId === groupId;
          }
          
          if (contextId && contextId.tool === 'wordAlignment') {
            progress = ProjectDetailsHelpers.getWordAlignmentProgressForGroupIndex(projectSaveLocation, contextId.reference.bookId, groupIndex);
          } else {
            progress = this.generateProgress(groupIndex);
          }
          
          const getGroupItems = (groupHeaderComponent) => {
            return this.getGroupItemComponents(currentGroupData, groupIndex, groupHeaderComponent);
          };
          
          return (
            <Group
              {...this.props}
              getGroupItems={getGroupItems}
              groupIndex={groupIndex}
              active={active}
              key={groupIndex.id}
              progress={progress}
              openGroup={() => this.props.actions.groupMenuChangeGroup(currentGroupData[0].contextId)}
            />
          );
        });
      }
    }
    return groupComponents;
  }

  render() {
    let { onToggleMenu } = this.props.actions;
    let { menuVisibility } = this.props.groupMenuReducer;
    return (
      <div className="group-menu">
        <div style={{ display: menuVisibility ? "block" : "none" }}>
          <Grid fluid style={groupMenuContainerStyle}>
            <Col style={
              {
                width: "250px",
                position: "fixed",
                padding: 0,
                backgroundColor: "var(--background-color-dark)",
                height: "95%",
              }
            }>
              {this.menu()}
            </Col>
          </Grid>
        </div>
        <Glyphicon
          style={menuVisibility ? style.slideButton : style.slideButtonCollapsed}
          glyph={menuVisibility ? 'chevron-left' : 'chevron-right'}
          onClick={onToggleMenu}
        />
      </div>
    );
  }
}

GroupMenuContainer.propTypes = {
  groupsDataReducer: PropTypes.any.isRequired,
  contextIdReducer: PropTypes.any.isRequired,
  projectDetailsReducer: PropTypes.any.isRequired,
  groupsIndexReducer: PropTypes.any.isRequired,
  actions: PropTypes.any.isRequired,
  groupMenuReducer: PropTypes.any.isRequired,
  toolsReducer: PropTypes.any.isRequired,
  wordAlignmentReducer: PropTypes.any.isRequired,
  translate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    groupsIndexReducer: state.groupsIndexReducer,
    groupsDataReducer: state.groupsDataReducer,
    selectionsReducer: state.selectionsReducer,
    contextIdReducer: state.contextIdReducer,
    resourcesReducer: state.resourcesReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    groupMenuReducer: state.groupMenuReducer,
    toolsReducer: state.toolsReducer,
    remindersReducer: state.remindersReducer,
    wordAlignmentReducer: state.wordAlignmentReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      changeCurrentContextId: contextId => {
        dispatch(changeCurrentContextId(contextId));
      },
      groupMenuChangeGroup: contextId => {
        dispatch(changeCurrentContextId(contextId));
        dispatch(expandSubMenu(true));
      },
      groupMenuExpandSubMenu: isSubMenuExpanded => {
        dispatch(expandSubMenu(isSubMenuExpanded));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupMenuContainer);
