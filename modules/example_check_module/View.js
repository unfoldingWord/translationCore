/**
 * An example check module component:
 * It just has a paragraph that displays the check status (default is UNCHECKED),
 * and a button to change it to RETAINED.
 */

// Get the Translation Core Module API
const api = window.ModuleApi;

// Get the React and ReactBootstrap libraries from the API
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

// Get Bootstrap elements
const Well = ReactBootstrap.Well;
const Button = ReactBootstrap.Button;
const ButtonGroup = ReactBootstrap.ButtonGroup;
const Glyphicon = ReactBootstrap.Glyphicon;

const NAMESPACE = 'ExampleChecker';

class View extends React.Component {
  
  constructor() {
    super();
    
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
    api.registerEventListener('goToNext', this.goToNext);
    api.registerEventListener('goToCheck', this.goToCheck);
  }
  
  goToNext() {
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
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
    var groups = api.getDataFromCheckStore(NAMESPACE, 'groups');
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    //error check to make sure we're going to a legal group/check index
    if (newGroupIndex !== undefined && newCheckIndex !== undefined) {
      if (newGroupIndex < groups.length) {
        api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', newGroupIndex);
        if (newCheckIndex < groups[currentGroupIndex].checks.length) {
          api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', newCheckIndex);
        }
        /* In the case that we're incrementing the check and now we're out of bounds
          * of the group, we increment the group.
          */
        else if (newCheckIndex == groups[currentGroupIndex].checks.length &&
          currentGroupIndex < groups.length - 1) {
          api.putDataInCheckStore(NAMESPACE, 'currentGroupIndex', currentGroupIndex + 1);
          api.putDataInCheckStore(NAMESPACE, 'currentCheckIndex', 0);
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
    var currentCheckFromStore = api.getCurrentCheck(NAMESPACE);
    this.setState({
        currentCheck: currentCheckFromStore
    });
  }
  
  updateCheckStatus(newCheckStatus) {
    var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
    var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
    var currentCheck = api.getCurrentCheck(NAMESPACE);
    currentCheck.checkStatus = newCheckStatus;
    api.emitEvent('changedCheckStatus', {
      groupIndex: currentGroupIndex,
      checkIndex: currentCheckIndex,
      checkStatus: newCheckStatus
    });
    this.updateState();
  }
  
  render() {
    var _this = this;
    return (
      <div>
        <Well>
          <p>Is this verse written in the correct language?</p>
          <ButtonGroup>
            <Button
              onClick={
                function() {
                  _this.updateCheckStatus('YES');
                }
              }
            >
              <span style={{color: 'green'}}>Yes</span>
            </Button>
            <Button
              onClick={
                function() {
                  _this.updateCheckStatus('NO');
                }
              }
            >
              <span style={{color: 'red'}}>No</span>
            </Button>
          </ButtonGroup>
        </Well>
      </div>
    );
  }
}

module.exports = {
  name: NAMESPACE,
  view: View
}