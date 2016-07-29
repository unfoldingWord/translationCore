/**
 * An abstract class that can be extended to easily create a check module.
 */

const React = require('react');
var api;

class CheckModule extends React.Component {
  constructor() {
    super();
    api = window.ModuleApi;
    
    this.state = {
      currentCheck: null
    };
    
    // Bind functions to the View object so the "this" context isn't lost
    this.updateCheckStatus = this.updateCheckStatus.bind(this);
    this.goToNext = this.goToNext.bind(this);
    this.goToCheck = this.goToCheck.bind(this);
    this.changeCurrentCheckInCheckStore = this.changeCurrentCheckInCheckStore.bind(this);
  }
  
  componentWillMount() {
    api.registerEventListener('goToNext', this.goToNext);
    api.registerEventListener('goToCheck', this.goToCheck);
    this.updateState();
  }
  
  componentWillUnmount() {
    api.removeEventListener('goToNext', this.goToNext);
    api.removeEventListener('goToCheck', this.goToCheck);
  }
  
  goToNext() {
    var currentCheckIndex = api.getDataFromCheckStore(this.nameSpace, 'currentCheckIndex');
    var currentGroupIndex = api.getDataFromCheckStore(this.nameSpace, 'currentGroupIndex');
    this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex + 1);
  }
  
  goToCheck(params) {
    this.changeCurrentCheckInCheckStore(params.groupIndex, params.checkIndex);
  }
  
  /**
   * @description - This is used to change our current check index and group index within the store
   * @param {object} newGroupIndex - the group index of the check selected in the navigation menu
   * @param {object} newCheckIndex - the group index of the check selected in the navigation menu
   */
  changeCurrentCheckInCheckStore(newGroupIndex, newCheckIndex) {
    // //Get the proposed changes and add it to the check
    // var proposedChanges = api.getDataFromCheckStore('ProposedChanges', 'currentChanges');
    // var currentCheck = this.state.currentCheck;
    // if (currentCheck && proposedChanges != "" && proposedChanges != this.getVerse('targetLanguage')) {
    //   currentCheck.proposedChanges = proposedChanges;
    // }

    var groups = api.getDataFromCheckStore(this.nameSpace, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(this.nameSpace, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(this.nameSpace, 'currentCheckIndex');
    //error check to make sure we're going to a legal group/check index
    if (newGroupIndex !== undefined && newCheckIndex !== undefined) {
      if (newGroupIndex < groups.length) {
        api.putDataInCheckStore(this.nameSpace, 'currentGroupIndex', newGroupIndex);
        if (newCheckIndex < groups[currentGroupIndex].checks.length) {
          api.putDataInCheckStore(this.nameSpace, 'currentCheckIndex', newCheckIndex);
        }
        /* In the case that we're incrementing the check and now we're out of bounds
          * of the group, we increment the group.
          */
        else if (newCheckIndex == groups[currentGroupIndex].checks.length &&
          currentGroupIndex < groups.length - 1) {
          api.putDataInCheckStore(this.nameSpace, 'currentGroupIndex', currentGroupIndex + 1);
          api.putDataInCheckStore(this.nameSpace, 'currentCheckIndex', 0);
        }
        //invalid indices: don't do anything else
        else {
          return;
        }
      }
    }
    this.updateState();
  }

  /**
   * @description - This method grabs the information that is currently in the
   * store and uses it to update our state, which in turn updates our view. This method is
   * typically called after the store is updated so that our view updates to the latest
   * data found in the store
   */
  updateState() {
    var currentGroupIndex = api.getDataFromCheckStore(this.nameSpace, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(this.nameSpace, 'currentCheckIndex');
    var currentCheckFromStore = api.getDataFromCheckStore(this.nameSpace, 'groups')[currentGroupIndex]['checks'][currentCheckIndex];
    var currentWord = api.getDataFromCheckStore(this.nameSpace, 'groups')[currentGroupIndex].group;
    this.setState({
      currentCheck: currentCheckFromStore
    });
    api.emitEvent('goToVerse', {
      chapterNumber: currentCheckFromStore.chapter,
      verseNumber: currentCheckFromStore.verse
    });
  }

  updateCheckStatus(newCheckStatus) {
    var groups = api.getDataFromCheckStore(this.nameSpace, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(this.nameSpace, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(this.nameSpace, 'currentCheckIndex');
    var currentCheck = groups[currentGroupIndex]['checks'][currentCheckIndex];
    currentCheck.checkStatus = newCheckStatus;
    api.emitEvent('changedCheckStatus', {
      groupIndex: currentGroupIndex,
      checkIndex: currentCheckIndex,
      checkStatus: newCheckStatus
    });
    this.updateState();
  }
}

module.exports = CheckModule;