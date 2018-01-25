import React, {Component} from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const GLitems =  ["Select Gateway Lanugage", "Chinese", "English", 
                  "Hindi", "French", "Portugese", "Spanish", "Telugu"]; 
let GLs = [];
for( let i = 0; i < GLitems.length; i++ ) {
  GLs.push(<MenuItem value={i} key={i} primaryText={`${GLitems[i]}`} />);
} 

/**
 * With the `maxHeight` property set, the Select Field will be scrollable
 * if the number of items causes the height to exceed this limit.
 */
export default class GlDropDownList extends Component {
  constructor() { 
    super();
    this.state = {   
      value: 2
    };
  }  

  selectionChange (event, index, value) {
    this.setState({value});
  }

  render() {
    return (
      <SelectField
        value={this.state.value}
        onChange={this.selectionChange}
        maxHeight={150}
      >
        {GLs}
      </SelectField>
    );
  }
}
