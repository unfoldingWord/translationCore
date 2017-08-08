import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import CopyrightCard from './CopyrightCard';
import { Card, CardText } from 'material-ui/Card';

const licenses = [
  {
    title: 'Creative Commons O / Public Domain',
    description: 'description nanan na h an amsvw,nsdjh kjekj',
    imageName: 'publicDomain.png'
  },
  {
    title: 'Creative Commons BY',
    description: 'description nanan na h an amsvw,nsdjh kjekj',
    imageName: 'ccBy.png'
  },
  {
    title: 'Creative Commons BY-SA',
    description: 'description nanan na h an amsvw,nsdjh kjekj',
    imageName: 'ccBySa.png'
  },
  {
    title: 'None of the Above',
    description: 'description nanan na h an amsvw,nsdjh kjekj',
    imageName: 'noCircle.png'
  }
]


class CopyRightCheck extends Component {

  componentDidMount() {
    // this.props.actions.changeProjectValidationInstructions(
    //   <div>
    //     <span>Please select the copyright status for this project.</span>
    //   </div>
    // )
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Licenses
        <Card style={{ height: '100%', marginTop: '5px', lineHeight: '2em' }}>
        {
          licenses.map((license, index) => {
            return (
              <CopyrightCard
                key={index}
                index={index}
                title={license.title}
                description={license.description}
                imageName={license.imageName}
              />
            );
          })
        }
        </Card>
      </div>
    );
  }
}

CopyRightCheck.propTypes = {
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired
}

export default CopyRightCheck;