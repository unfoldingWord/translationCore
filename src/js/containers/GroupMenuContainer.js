/* eslint-disable react/no-find-dom-node */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Grid, Col, Glyphicon } from 'react-bootstrap';
import * as style from '../components/groupMenu/Style';
// components
import Groups from '../components/groupMenu/Groups';
import Group from '../components/groupMenu/Group';
import GroupItem from '../components/groupMenu/GroupItem';
// actions
import { changeCurrentContextId } from '../actions/ContextIdActions.js';
import { expandSubMenu } from '../actions/GroupMenuActions.js';
import * as CheckDataLoadActions from '../actions/CheckDataLoadActions';
import isEqual from 'lodash/isEqual';
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

class GroupMenuContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  menu(currentToolName) {
    let menu = <div />;
    if (currentToolName !== null) {
      menu = (
        <Groups groups={this.groups()} />);
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
 * @return {number} - progress percentage.
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

  getStatusGlyph(contextId, groupIndex) {
    let statusBooleans = this.getItemGroupData(contextId, groupIndex);
    let { comments, reminders, selections, verseEdits } = statusBooleans;
    const { chapter, verse } = contextId.reference;
    const { alignmentData } = this.props.wordAlignmentReducer;
    const wordBank = Object.keys(alignmentData).length === 0 ? null : alignmentData[chapter][verse].wordBank;
    const { currentToolName } = this.props.toolsReducer;
    let statusGlyph = (
      <Glyphicon glyph="" style={style.menuItem.statusIcon.blank} /> // blank as default, in case no data or not active
    );
    if (reminders) {
      statusGlyph = (
        <Glyphicon glyph="bookmark" style={style.menuItem.statusIcon.bookmark} />
      );
    } else if (selections) {
      statusGlyph = (
        <Glyphicon glyph="ok" style={style.menuItem.statusIcon.correct} />
      );
    } else if (verseEdits) {
      statusGlyph = (
        <Glyphicon glyph="pencil" style={style.menuItem.statusIcon.verseEdit} />
      );
    } else if (comments) {
      statusGlyph = (
        <Glyphicon glyph="comment" style={style.menuItem.statusIcon.comment} />
      );
    } else if (currentToolName === 'wordAlignment' && wordBank && wordBank.length === 0) {
      statusGlyph = (
        <Glyphicon glyph="ok" style={style.menuItem.statusIcon.correct} />
      );
    }
    return statusGlyph;
  }

  scrollIntoView(element) {
    ReactDOM.findDOMNode(element).scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  /**
 * @description Maps all groupData aka check objects to GroupItem components
 * @param {array} groupData - array of all groupData objects
 * @param {bool} active - whether or not the group is active/current
 * @return {array} groupItems - array of groupData mapped to GroupItem components
 */
  getGroupItemComponents(groupData, groupIndex, groupHeaderComponent) {
    let items = [];
    let index = 0;
    let contextIdReducer = {...this.props.contextIdReducer};
    let projectDetailsReducer = {...this.props.projectDetailsReducer};
    for (let groupItemData of groupData) {
      let selectionsArray = [];
      contextIdReducer.contextId = groupItemData.contextId;
      let loadPath = CheckDataLoadActions.generateLoadPath(projectDetailsReducer, contextIdReducer, 'selections');
      let selectionsObject = CheckDataLoadActions.loadCheckData(loadPath, groupItemData.contextId);
      if (selectionsObject) selectionsObject.selections.forEach((selection) => {
        selectionsArray.push(selection.text);
      });
      let selections = selectionsArray.join(" ");
      let active = isEqual(groupItemData.contextId, this.props.contextIdReducer.contextId);
      let bookName = this.props.projectDetailsReducer.manifest.project.name;

      if (selections) {
        //Convert the book name to the abbreviation tit -> Tit
        let bookAbbr = this.props.projectDetailsReducer.manifest.project.id;
        bookName = bookAbbr.charAt(0).toUpperCase() + bookAbbr.slice(1);
      }
      items.push(
        <GroupItem
          key={index}
          {...this.props}
          {...groupItemData}
          statusGlyph={this.getStatusGlyph(groupItemData.contextId, groupIndex)}
          groupMenuHeader={groupHeaderComponent}
          scrollIntoView={this.scrollIntoView}
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
    let groups = <div />; // leave an empty container when required data isn't available
    let { groupsData } = this.props.groupsDataReducer;

    if (groupsIndex !== undefined) {
      groups = groupsIndex.filter(groupIndex => {
        return groupsData !== undefined && Object.keys(groupsData).includes(groupIndex.id);
      });
      groups = groups.map(groupIndex => {
        let { contextId } = this.props.contextIdReducer;
        let groupId = groupIndex.id;
        let active = false;
        if (contextId !== null) {
          active = contextId.groupId == groupId;
        }
        let progress = this.generateProgress(groupIndex);
        let currentGroupData = this.getGroupData(groupsData, groupId);
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
      }
      );
    }
    return groups;
  }

  render() {
    let { onToggleMenu } = this.props.actions;
    let { menuVisibility } = this.props.groupMenuReducer;
    let { currentToolName } = this.props.toolsReducer;
    return (
      <div>
        <div style={{ display: menuVisibility ? "block" : "none" }}>
          <Grid fluid style={groupMenuContainerStyle}>
            <Col style={
              {
                width: "250px",
                position: "fixed",
                padding: 0,
                backgroundColor: "var(--background-color-dark)",
                height: "95%",
                overflowY: "scroll"
              }
            }>
              {this.menu(currentToolName)}
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
  wordAlignmentReducer: PropTypes.any.isRequired
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
    wordAlignmentReducer: state.wordAlignmentReducer
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
