import React, {Component} from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';

const GLitems =  ["Gateway Lanugage", "Chinese", "English", 
                  "Hindi", "French", "Portugese", "Spanish", "Telugu"]; 
let GLs = [];
for( let i = 0; i < GLitems.length; i++ ) {
  GLs.push(<MenuItem value={i} key={i} primaryText={`${GLitems[i]}`} />);
} 

/**
 * With the `maxHeight` property set, the Select Field will be scrollable
 * if the number of items causes the height to exceed this limit.
 */
export default class GLDropDownList extends Component {
  render() {
    return (
      <SelectField
        value={this.props.currentGLSelection}
        onChange={ (event, index, value) => this.props.selectionChange(value) }
        maxHeight={150}  
      >
        {GLs}
      </SelectField>
    );
  }
}

//GLDropDownList.propTypes = {
  //currentGLSelection: PropTypes.function,
  //selectionChange: PropTypes.string
//};