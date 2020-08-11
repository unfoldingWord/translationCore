import React from 'react';
import { getAttributions } from '../../../helpers/LicensesHelpers';
import attributionData from './attributionData.json';

class ThirdPartyAttributions extends React.Component {
  render() {
    let attributions = getAttributions(attributionData.packages);
    attributions = attributions.concat(getAttributions(attributionData.fonts));
    return (
      <div>
        {attributions}
      </div>
    );
  }
}

export default ThirdPartyAttributions;
