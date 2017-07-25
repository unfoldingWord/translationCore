import React from "react"
import Licenses from "./newLicenses.json"

class ThirdParty extends React.Component {
  render() {
    let libraries = []
    for(let license in Licenses){
      libraries.push(
        <div key={license} style={{paddingBottom: "50px", borderTop: "1px solid var(--border-color)"}}>
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
