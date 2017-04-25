import React from "react"
import Licenses from "./licenses.json"

class ThirdParty extends React.Component {
  render() {
    let libraries = {}
    for(license in Licenses){
      libraries.push(
        <div>
          <center>{license}</center>
          <center>{license.licenses}</center>
          <center>{license.repository}</center>
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
