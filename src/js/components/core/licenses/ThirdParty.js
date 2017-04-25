import React from "react"
import Licenses from "./newLicenses.json"

class ThirdParty extends React.Component {
  render() {
    let libraries = []
    for(let license in Licenses){
      console.log(license);
      libraries.push(
        <div>
          <center>{license}</center>
          <center>{Licenses[license].licenses}</center>
          <center><a href={Licenses[license].repository}>link to license</a></center>
        </div>
      )
    }
    return(
      <div>
        {libraries}
      </div>
    )
  }
}

module.exports = ThirdParty
