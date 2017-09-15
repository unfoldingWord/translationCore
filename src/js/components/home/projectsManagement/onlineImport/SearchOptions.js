import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField } from 'material-ui';
import BookDropdownMenu from './BookDropDownMenu';

export default class SearchOptions extends Component {
  constructor() {
    super();
    this.state = {
      userBoxValue: "",
      laguageIdValue: "",
      bookIdValue: ""
    };
  }

  componentWillMount() {
    let { username } = this.props;
    this.setState({userBoxValue: username ? username : "" })
    this.props.actions.searchReposByUser(username);
  }

  searchProject() {
    const query = {
      user: this.state.userBoxValue,
      bookId: this.state.bookIdValue,
      laguageId: this.state.laguageIdValue
    }
    this.props.actions.searchReposByQuery(query)
  }

  render() {
    return (
      <div>
        <span style={{ display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>
          - Or -
        </span>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <TextField
            value={this.state.userBoxValue}
            floatingLabelText="User"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
            onChange={e => this.setState({userBoxValue: e.target.value})}
          />&nbsp;&nbsp;
          <TextField
            value={this.state.laguageIdValue}
            floatingLabelText="Language Id"
            underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
            floatingLabelStyle={{ color: "var(--text-color-dark)", opacity: "0.3", fontWeight: "500"}}
            onChange={e => this.setState({laguageIdValue: e.target.value})}
          />&nbsp;&nbsp;
          <BookDropdownMenu
            updateBookIdValue={bookIdValue => this.setState({ bookIdValue })}
            bookIdValue={this.state.bookIdValue}
          />&nbsp;&nbsp;
          <button
            label="Search"
            className="btn-prime"
            onClick={() => this.searchProject()}
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
