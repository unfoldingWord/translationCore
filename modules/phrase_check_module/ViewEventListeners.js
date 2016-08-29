
const api = window.ModuleApi;
const NAMESPACE = "PhraseChecker";

module.exports = {
    goToNext(params){
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex + 1);
    },

    goToPrevious(params){
        var currentCheckIndex = api.getDataFromCheckStore(NAMESPACE, 'currentCheckIndex');
        var currentGroupIndex = api.getDataFromCheckStore(NAMESPACE, 'currentGroupIndex');
        this.changeCurrentCheckInCheckStore(currentGroupIndex, currentCheckIndex - 1);
    },

    goToCheck(params){
      this.changeCurrentCheckInCheckStore(params.groupIndex, params.checkIndex);
    },

    changeCheckType: function(params) {
      if(params.currentCheckNamespace === NAMESPACE) {
        this.updateState();
      }
    }

}
