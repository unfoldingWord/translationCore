const api = window.ModuleApi;

//let currentNAMESPACE = CoreStore.getCurrentCheckNamespace();
let currentNAMESPACE = "TranslationNotesChecker";


module.exports.goToCheck = function (newGroupIndex, newCheckIndex) {
  return {
    type: "GO_TO_CHECK",
    currentGroupIndex: newGroupIndex,
    currentCheckIndex: newCheckIndex,  }
};

module.exports.goToNext = function () {
  let newGroupIndex;
  let newCheckIndex;
  let currentGroupIndex = api.getDataFromCheckStore(currentNAMESPACE, 'currentGroupIndex');
  let currentCheckIndex = api.getDataFromCheckStore(currentNAMESPACE, 'currentCheckIndex');
  let groups = api.getDataFromCheckStore(currentNAMESPACE, 'groups');
  if((currentCheckIndex + 1) < groups[currentGroupIndex].checks.length){
    newGroupIndex = currentGroupIndex;
    newCheckIndex = currentCheckIndex + 1;
    api.putDataInCheckStore(currentNAMESPACE, 'currentGroupIndex', newGroupIndex);
    api.putDataInCheckStore(currentNAMESPACE, 'currentCheckIndex', newCheckIndex);
  }else if(currentCheckIndex + 1) > groups[currentGroupIndex].checks.length){
    newGroupIndex = currentGroupIndex + 1;
    newCheckIndex = 0;
    api.putDataInCheckStore(currentNAMESPACE, 'currentGroupIndex', newGroupIndex);
    api.putDataInCheckStore(currentNAMESPACE, 'currentCheckIndex', newCheckIndex);
  }
  return {
    type: "GO_TO_NEXT",
    currentGroupIndex: newGroupIndex,
    currentCheckIndex: newCheckIndex,
  }
};

module.exports.goToPrevious = function () {
  let newGroupIndex;
  let newCheckIndex;
  let currentGroupIndex = api.getDataFromCheckStore(currentNAMESPACE, 'currentGroupIndex');
  let currentCheckIndex = api.getDataFromCheckStore(currentNAMESPACE, 'currentCheckIndex');
  let groups = api.getDataFromCheckStore(currentNAMESPACE, 'groups');
  if(currentCheckIndex >= 1){
    newGroupIndex = currentGroupIndex;
    newCheckIndex = currentCheckIndex - 1;
    api.putDataInCheckStore(currentNAMESPACE, 'currentGroupIndex', newGroupIndex);
    api.putDataInCheckStore(currentNAMESPACE, 'currentCheckIndex', newCheckIndex);
  }else if (currentCheckIndex == 0 && currentGroupIndex != 0) {
    newGroupIndex = currentGroupIndex - 1;
    newCheckIndex = 0;
    api.putDataInCheckStore(currentNAMESPACE, 'currentGroupIndex', newGroupIndex);
    api.putDataInCheckStore(currentNAMESPACE, 'currentCheckIndex', newCheckIndex);
  }else if(currentCheckIndex == 0 && currentGroupIndex == 0){
    newGroupIndex = currentGroupIndex;
    newCheckIndex = currentCheckIndex;
  }
  return {
    type: "GO_TO_PREVIOUS",
    currentGroupIndex: newGroupIndex,
    currentCheckIndex: newCheckIndex,
  }
};
