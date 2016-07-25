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
  }
  
  componentWillMount() {
    
  }
  
  componentWillUnmount() {
    
  }
  
  render() {
    
  }
}

module.exports = {
  name: NAMESPACE,
  view: View
}