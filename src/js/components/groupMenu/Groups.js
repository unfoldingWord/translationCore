import React from 'react';

class Groups extends React.Component {

  render() {
    return (
      <div style={{ color: "var(--reverse-color)", width: "100%" }}>
        {this.props.groups}
      </div>
    );
  }
}

export default Groups;
