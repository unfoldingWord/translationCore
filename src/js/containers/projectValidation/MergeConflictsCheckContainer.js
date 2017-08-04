import { connect } from 'react-redux'
import React, { Component } from 'react';
import MergeConflictsCheck from '../../components/projectValidation/MergeConflictsCheck'
import * as ProjectValidationActions from '../../actions/ProjectValidationActions';

class MergeConflictsCheckContainer extends Component {
    render() {
        return (
            <MergeConflictsCheck {...this.props}/>
        );
    }
}


const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeConflictsCheckContainer)