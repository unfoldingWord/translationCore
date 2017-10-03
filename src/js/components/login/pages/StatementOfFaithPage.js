import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Glyphicon} from 'react-bootstrap';

class StatementOfFaithPage extends Component {
  render() {
    return (
      <div>
        <button
          className="btn-second"
          onClick={() => this.props.switchInfoPage("termsAndConditions")}>
          <Glyphicon glyph="share-alt" style={{transform: "scaleX(-1)"}} />&nbsp;
          Go Back
        </button>
        <div style={{color: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h4><b>Statement of Faith</b></h4>
          <p>
            <i>
            The following statement of faith is subscribed to by all member&nbsp;
            organizations of and contributors to the unfoldingWord project.&nbsp;
            It is in agreement with the Lausanne Covenant.
            </i>
          </p>
          <p>
            We believe that Christian belief can and should be divided into&nbsp;
            <b>essential beliefs</b> and <b>peripheral beliefs.</b>
          </p>
          <h4><b>Essential beliefs</b></h4>
          <p>
            Essential beliefs are what define a follower of Jesus Christ and can never be compromised or ignored.
          </p>
          <ul style={{marginLeft: "30px", padding: "10px"}}>
            <li>
              We believe the Bible to be the only inspired, inerrant, sufficient, authoritative Word of God.
            </li>
            <li>
              We believe that there is one God, eternally existent in three persons: God the Father, Jesus&nbsp;
              Christ the Son and the Holy Spirit.
            </li>
            <li>
              We believe in the deity of Jesus Christ.
            </li>
            <li>
              We believe in the humanity of Jesus Christ, in His virgin birth, in His sinless life,&nbsp;
              in His miracles, in His vicarious and atoning death through His shed blood, in His bodily&nbsp;
              resurrection, in His ascension to the right hand of the Father.
            </li>
            <li>
              We believe that every person is inherently sinful and so is deserving of eternal hell.
            </li>
            <li>
              We believe that salvation from sin is a gift of God, provided through the sacrificial death and&nbsp;
              resurrection of Jesus Christ, attained by grace through faith, not by works.
            </li>
            <li>
              We believe that true faith is always accompanied by repentance and regeneration by the Holy Spirit.
            </li>
            <li>
              We believe in the present ministry of the Holy Spirit by whose indwelling the follower of Jesus&nbsp;
              Christ is enabled to live a godly life.
            </li>
            <li>
              We believe in the spiritual unity of all believers in the Lord Jesus Christ, from all nations and&nbsp;
              languages and people groups.
            </li>
            <li>
              We believe in the personal and physical return of Jesus Christ.
            </li>
            <li>
              We believe in the resurrection of both the saved and the lost; the unsaved will be resurrected to&nbsp;
              eternal damnation in hell and the saved will be resurrected to eternal blessing in heaven with God.
            </li>
          </ul>
          <h4><b>Peripheral beliefs</b></h4>
          <p>
            Peripheral beliefs are everything else that is in Scripture but about which sincere followers&nbsp;
            of Christ may disagree (e.g. Baptism, Lord’s Supper, the Rapture, etc.). We choose to agree to&nbsp;
            disagree agreeably on these topics and press on together toward a common goal of making disciples&nbsp;
            of every people group (Matthew 28:18-20).
          </p>
        </div>
      </div>
    );
  }
}

StatementOfFaithPage.propTypes = {
    switchInfoPage: PropTypes.func.isRequired
};

export default StatementOfFaithPage;
