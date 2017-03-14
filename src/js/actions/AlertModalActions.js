const consts = require('./CoreActionConsts');
const UploadMethods = require('../components/core/UploadMethods.js');
const ModalActions = require('./ModalActions.js');

module.exports.showAlert = (alertMessage) => {
    if (alertMessage) {
        return {
            type: consts.SHOW_ALERT_MODAL,
            title: alertMessage['title'],
            content: alertMessage['content'],
            leftButtonText: alertMessage['leftButtonText'],
            rightButtonText: alertMessage['rightButtonText'],
            moreInfo: alertMessage['moreInfo'].toString(),
            visibility: true
        }
    } else {
        return {
            type: consts.SHOW_ALERT_MODAL,
            title: null,
            content: null,
            leftButtonText: null,
            rightButtonText: null,
            moreInfo: null,
            visibility: false
        }
    }
}

module.exports.alertDismiss = () => {
    
    var response = this.state.alertModalProps.leftButtonText;
    this.setState(merge({}, this.state, {
        alertModalProps: {
            visibility: false,
            alertMessage: {}
        }
    }), CoreActions.sendAlertResponse(response));
    //CoreActions.sendAlertResponse will need to be refactored out eventually, may be one of the harder functions to fix
},

