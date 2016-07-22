/**
 * @author Logan Lebanoff
 * @description This component allows you to switch between Check Modules.
 *              When the selection changes, then the data from check_data.json
 *              is loaded into CheckStore.
 ******************************************************************************/
var React = require('react');
var Well = require('react-bootstrap/lib/Well.js');
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var CoreStore = require('../../stores/CoreStore.js');

const api = window.ModuleApi;

const NONE_SELECTED = "NONE_SELECTED";

class SwitchCheckModuleDropdown extends React.Component {

  constructor() {
    super();
    this.state = {
      checkCategoryOptions: null
    };

    this.getCheckCategoryOptions = this.getCheckCategoryOptions.bind(this);
  }

  // When the dropdown is changed, this sends out an event to change the check category
  checkModuleChange(e) {
    var newCheckCategory = e.target.value;
    api.emitEvent('changeCheckType', {currentCheckNamespace: newCheckCategory});
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.getCheckCategoryOptions);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.getCheckCategoryOptions);
  }

  getCheckCategoryOptions() {
    this.setState({
      checkCategoryOptions: CoreStore.getCheckCategoryOptions()
    });
    //console.log(CoreStore.getCheckCategoryOptions());
  }

  render() {
    if (this.state.checkCategoryOptions) {
      var optionNodes = this.state.checkCategoryOptions.map((checkCategory) => {
        return (
          <option key={checkCategory.name} value={checkCategory.name}>{checkCategory.name}</option>
        )
      });

      return (
        <Well>
          <FormGroup>
            <ControlLabel>Select a Check Category</ControlLabel>
            <FormControl componentClass="select" onChange={this.checkModuleChange}>
              {optionNodes}
            </FormControl>
          </FormGroup>
        </Well>
      );
    }
    return (
      <Well style={{minHeight: "25px"}}>{' '}</Well>
    );
  }
}
module.exports = SwitchCheckModuleDropdown;
