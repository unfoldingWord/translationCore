var React = require('react');
var CheckActions = require('../../actions/CheckActions.js');
var AbstractCheckModule = require('./AbstractCheckModule.js');
/*
An example check module component:
It just has a paragraph that displays the check status (default is UNCHECKED),
and a button to change it to RETAINED.

Things to notice:
- class ExampleCheckModule extends AbstractCheckModule
- super.getCurrentCheck() -- equivalent to this.state.currentCheck
  * this is how you get data
- CheckActions.changeCheckProperty(propertyName, propertyValue)
  * this is how you change data
*/

class ExampleCheckModule extends AbstractCheckModule {

  constructor() {
    super();
  }

  retainedButtonClicked() {
    // Sends an action which will update the current check in CheckStore
    // Property name: checkStatus
    // Property value: 'RETAINED'
    // You can put objects in for the property value too, not just strings
    CheckActions.changeCheckProperty("checkStatus", "RETAINED");
  }

  render() {
    return (
      <div>
        <p>{super.getCurrentCheck().checkStatus}</p>
        <button onClick={this.retainedButtonClicked.bind(this)}>Retained</button>
      </div>
    );
  }
};
module.exports = ExampleCheckModule;
