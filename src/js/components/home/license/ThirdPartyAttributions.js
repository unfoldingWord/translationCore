import React from "react";
import attributionData from "./attributionData.json";

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

const getAttributions = (attributionMap) => {
  let attributions = [];
  for(let name in attributionMap) {
    attributions.push(
      <div key={name} style={{paddingTop: "10px", textAlignment: "center"}}>
        <p>
          <a href={attributionMap[name].repository}>{name}</a><br/>
          {attributionMap[name].license}
        </p>
        <hr style={{width: "50%"}}/>
      </div>
    );
  }
  return attributions;
};

module.exports = ThirdPartyAttributions;
