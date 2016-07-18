/**
 * @description: This file builds the chapters
 * @author: Ian Hoegen
 ******************************************************************************/
// const React = require('react');

const api = window.ModuleApi;
const React = api.React;

class Chapter extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <h5>
          <strong>Chapter {this.props.chapterNum}</strong>
        </h5>
        <div>{this.props.arrayOfVerses}</div>
      </div>
    );
  }
}

module.exports = Chapter;
