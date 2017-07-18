import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'material-ui';
import BookDropDownMenu from './BookDropDownMenu';

export default class SearchOptions extends Component {
  constructor() {
    super();
    this.state = {
      userBoxValue: "",
      dropDownMenuValue: ""
    };
    this.searchReposByQuery = this.searchReposByQuery.bind(this);
  }

  componentWillMount() {
    let { username } = this.props;
    this.setState({userBoxValue: username ? username : "" })
    this.props.actions.searchReposByUser(username);
  }

  searchReposByQuery(bibleId) {
    this.props.actions.searchReposByQuery(bibleId, this.state.userBoxValue);
    this.setState({ dropDownMenuValue: bibleId })
  }

  render() {
    return (
      <div>
        <span style={{ display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>- Or -</span>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <TextField
            value={this.state.userBoxValue}
            floatingLabelText="User"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
            onChange={e => this.setState({userBoxValue: e.target.value})}
          />&nbsp;&nbsp;
          <TextField
            floatingLabelText="Language Id"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
            onChange={e => this.props.actions.searchReposByQuery(e.target.value)}
          />&nbsp;&nbsp;
          <BookDropDownMenu
            searchReposByQuery={(value) => this.searchReposByQuery(value)}
            dropDownMenuValue={this.state.dropDownMenuValue}
          />&nbsp;&nbsp;
          <button
            label="Search"
            className="btn-prime"
            onClick={() => console.log("search")}
            style={{ margin: "0px 0px -20px", width: "400px" }}
          >
            Search
          </button>
        </div>
      </div>
    );
  }
}

SearchOptions.propTypes = {
  actions: PropTypes.object.isRequired,
  importLink: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
};
