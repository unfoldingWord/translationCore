import React from "react";
import attributionData from "./attributionData.json";
import {getAttributions} from "../../../helpers/LicensesHelpers"

class ThirdPartyAttributions extends React.Component {
  render() {
    let attributions = getAttributions(attributionData.packages);
    attributions = attributions.concat(getAttributions(attributionData.fonts));
    return(
      <div>
        {attributions}
      </div>
    );
  }
}

module.exports = ThirdPartyAttributions;
