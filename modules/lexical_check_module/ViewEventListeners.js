
const api = window.ModuleApi;
const NAMESPACE = "LexicalChecker";

module.exports = {
    goToNext: function(params) {
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex + 1);
    },
    
    goToPrevious: function(params) {
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex - 1);
    },

    goToCheck: function(params) {
      this.changeCurrentCheckInCheckStore(params.groupIndex, params.checkIndex);
    },

    changeCheckType: function(params) {
      if(params.currentCheckNamespace === NAMESPACE) {
        this.updateState();
      }
    }
}
