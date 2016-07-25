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

// Define a namespace for this specific module
const NAMESPACE = "ExampleChecker";

class View extends React.Component {
  
  constructor() {
    super();
    
    this.state = {
      currentCheck: {
        checkStatus: 'UNCHECKED'
      }
    };
    
    // Bind the function to the View object so the "this" context isn't lost
    this.retainedButtonClicked = this.retainedButtonClicked.bind(this);
  }
  
  componentWillMount() {
    
  }
  
  componentWillUnmount() {
    
  }
  
  retainedButtonClicked() {
    api.sendAction({
      type: 'updateCheckStatus',
      field: 'ExampleChecker',
      checkStatus: 'RETAINED'
    });
  }
  
  updateCheckStatus(exampleCheckData, action) {
    var currentCheckFromStore = exampleCheckData.groups[exampleCheckData.currentGroupIndex]['checks'][exampleCheckData.currentCheckIndex];
    if (currentCheckFromStore.checkStatus) {
      currentCheckFromStore.checkStatus = action.checkStatus;
      api.emitEvent('changedCheckStatus', {currentCheckNamespace: NAMESPACE});
    }
    this.setState({
      currentCheck: currentCheckFromStore
    });
  }
  
  render() {
    return (
      <div>
        <p>{this.state.currentCheck.checkStatus}</p>
        <button onClick={this.retainedButtonClicked}>Retained</button>
      </div>
    );
  }
}

module.exports = {
  name: NAMESPACE,
  view: View
}