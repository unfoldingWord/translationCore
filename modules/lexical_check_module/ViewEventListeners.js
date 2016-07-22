
const api = window.ModuleApi;
const NAMESPACE = "LexicalCheck";

module.exports = {
    goToNext: function(params) {
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        api.sendAction({
          type: 'changeLexicalCheck',
          field: NAMESPACE,
          checkIndex: currentCheckIndex + 1,
          groupIndex: currentGroupIndex
        });
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