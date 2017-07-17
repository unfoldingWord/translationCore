import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'material-ui';
import URLInput from './URLInput';

export default class Door43ProjectSearch extends Component {
  constructor() {
    super();
    this.state = {
      userBoxValue: ""
    }
  }

  componentWillMount() {
    let { username } = this.props;
    this.setState({userBoxValue: username ? username : "" })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props != nextProps) {
      let { username } = nextProps;
      this.setState({userBoxValue: username ? username : "" })
    }
  }

  render() {
    let {
      actions: {
        handleURLInputChange,
        loadProjectFromLink
      },
      importLink
    } = this.props;

    return (
      <div>
        <URLInput
          handleURLInputChange={handleURLInputChange}
          importLink = {importLink}
          load={loadProjectFromLink}
        />
        <h4 style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>- Or -</h4>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <TextField
            value={this.state.userBoxValue}
            floatingLabelText="User"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
            onChange={e => this.setState({userBoxValue: e.target.value})}
          />&nbsp;&nbsp;
          <TextField
            floatingLabelText="Book/Language"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
            onChange={e => console.log(e.target.value)}
          />&nbsp;&nbsp;&nbsp;
          <button label="Search" className="btn-prime" onClick={() => console.log("search")} style={{ margin: "0px 0px -20px" }}>
            Search
          </button>
        </div>
      </div>
    );
  }
}

Door43ProjectSearch.propTypes = {
  actions: PropTypes.object.isRequired,
  importLink: PropTypes.string.isRequired
};
