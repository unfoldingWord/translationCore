
const api = window.ModuleApi;
const NAMESPACE = "LexicalChecker";

module.exports = {
    goToNext: function(params) {
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex + 1);
    },

    goToCheck: function(params) {
      api.sendAction({type: 'changeLexicalCheck', field: NAMESPACE,
        checkIndex: params.checkIndex, groupIndex: params.groupIndex});
    },

    changeCheckType: function(params) {
      if(params.currentCheckNamespace === NAMESPACE) {
        this.updateState();
      }
    }
}
