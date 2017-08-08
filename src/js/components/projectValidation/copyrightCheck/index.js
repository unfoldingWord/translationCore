import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import CopyrightCard from './CopyrightCard';
import { Card } from 'material-ui/Card';

class CopyRightCheck extends Component {

  componentDidMount() {
    // this.props.actions.changeProjectValidationInstructions(
    //   <div>
    //     <span>Please select the copyright status for this project.</span>
    //   </div>
    // )
  }

  render() {
    const licenses = [
      {
        title: 'Creative Commons O / Public Domain',
        description: 'description nanan na h an amsvw,nsdjh kjekj',
        id: 'CC-0-Public-Domain',
        imageName: 'publicDomain.png'
      },
      {
        title: 'Creative Commons BY',
        description: 'description nanan na h an amsvw,nsdjh kjekj',
        id: 'CC-BY',
        imageName: 'ccBy.png'
      },
      {
        title: 'Creative Commons BY-SA',
        description: 'description nanan na h an amsvw,nsdjh kjekj',
        id: 'CC-BY-SA',
        imageName: 'ccBySa.png'
      },
      {
        title: 'None of the Above',
        description: 'description nanan na h an amsvw,nsdjh kjekj',
        id: 'none',
        imageName: 'noCircle.png'
      }
    ];

    const { selectedProjectLicense } = this.props.reducers.copyrightCheckReducer;

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
                id={license.id}
                title={license.title}
                actions={this.props.actions}
                imageName={license.imageName}
                description={license.description}
                selectedProjectLicense={selectedProjectLicense}
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