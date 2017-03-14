const consts = require('../actions/CoreActionConsts');

const initialState = {
    visibility: false,
    title: alertMessage['title'],
    content: alertMessage['content'],
    leftButtonText: alertMessage['leftButtonText'],
    rightButtonText: alertMessage['rightButtonText'],
    moreInfo: alertMessage['moreInfo'].toString(),
    alertMessage: {},
    response:null
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        default:
            return state;
    }
}



            handleAlertOK: () => {
                var response = this.state.alertModalProps.rightButtonText;
                this.setState(merge({}, this.state, {
                    switchCheckModalProps: {
                        visibility: false,
                        alertMessage: {}
                    }
                }), CoreActions.sendAlertResponse(response));
                //CoreActions.sendAlertResponse will need to be refactored out eventually, may be one of the harder functions to fix
            },

                getStyleFromState: (value) => {
                    if (value) {
                        return {
                            height: '30px',
                            width: '60px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            padding: 0,
                            left: '50%'
                        }
                    } else {
                        return {
                            display: 'none'
                        }
                    }
                }