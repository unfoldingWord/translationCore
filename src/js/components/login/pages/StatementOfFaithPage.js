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
          <h4>Statement of Faith</h4>
          <p><em>The following statement of faith is subscribed to by all member organizations of and contributors to the <a href="https://unfoldingword.org/" title="unfoldingWord">unfoldingWord</a> project. It is in agreement with these historical creeds: <a href="https://git.door43.org/Door43/en_creeds/src/master/content/apostles.md" title="Apostles' Creed">Apostles’ Creed</a>, <a href="https://git.door43.org/Door43/en_creeds/src/master/content/nicene.md" title="Nicene Creed">Nicene Creed</a>, and <a href="https://git.door43.org/Door43/en_creeds/src/master/content/athanasian.md" title="Athanasian Creed">Athanasian Creed</a>; and also the <a href="http://www.lausanne.org/en/documents/lausanne-covenant.html" title="Lausanne Covenant">Lausanne Covenant</a>.</em></p>
          <p>We believe that Christian belief can and should be divided into <strong>essential beliefs</strong> and <strong>peripheral beliefs</strong> (Romans 14).</p>
          <h5>Essential beliefs</h5>
          <p>Essential beliefs are what define a follower of Jesus Christ and can never be compromised or ignored.</p>
            <ul>
              <li><p>We believe the Bible to be the only inspired, inerrant, sufficient, authoritative Word of God (1 Thessalonians 2:13; 2 Timothy 3:16-17).</p>
              </li>
              <li><p>We believe that there is one God, eternally existent in three persons: God the Father, Jesus Christ the Son, and the Holy Spirit (Matthew 28:19; John 10:30).</p>
              </li>
              <li><p>We believe in the deity of Jesus Christ (John 1:1-4; Philippians 2:5-11; 2 Peter 1:1).</p>
              </li>
              <li><p>We believe in the humanity of Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His vicarious and atoning death through His shed blood, in His bodily resurrection, and in His ascension to the right hand of the Father (Matthew 1:18,25; 1 Corinthians 15:1-8; Hebrews 4:15; Acts 1:9-11; Acts 2:22-24).</p>
              </li>
              <li><p>We believe that every person is inherently sinful and so is deserving of eternal hell (Romans 3:23; Isaiah 64:6-7).</p>
              </li>
              <li><p>We believe that salvation from sin is a gift of God, provided through the sacrificial death and resurrection of Jesus Christ, attained by grace through faith, not by works (John 3:16; John 14:6; Ephesians 2:8-9, Titus 3:3-7).</p>
              </li>
              <li><p>We believe that true faith is always accompanied by repentance and regeneration by the Holy Spirit (James 2:14-26; John 16:5-16; Romans 8:9).</p>
              </li>
              <li><p>We believe in the present ministry of the Holy Spirit by whose indwelling the follower of Jesus Christ is enabled to live a godly life (John 14:15-26; Ephesians 2:10; Galatians 5:16-18).</p>
              </li>
              <li><p>We believe in the spiritual unity of all believers in the Lord Jesus Christ, from all nations and languages and people groups (Philippians 2:1-4; Ephesians 1:22-23; 1 Corinthians 12:12,27).</p>
              </li>
              <li><p>We believe in the personal and physical return of Jesus Christ (Matthew 24:30; Acts 1:10-11).</p>
              </li>
              <li><p>We believe in the resurrection of both the saved and the lost; the unsaved will be resurrected to eternal damnation in hell and the saved will be resurrected to eternal blessing in heaven with God (Hebrews 9:27-28; Matthew 16:27; John 14:1-3; Matthew 25:31-46).</p>
              </li>
            </ul>
          <h5>Peripheral beliefs</h5>
          <p>Peripheral beliefs are everything else that is in Scripture but about which sincere followers of Christ may disagree (e.g. Baptism, Lord’s Supper, the Rapture, etc.). We choose to agree to disagree agreeably on these topics and press on together toward a common goal of making disciples of every people group (Matthew 28:18-20).</p>
        </div>
      </div>
    );
  }
}

StatementOfFaithPage.propTypes = {
    switchInfoPage: PropTypes.func.isRequired
};

export default StatementOfFaithPage;
