import consts from './ActionTypes';

export function selectProjectLicense(selectedProjectLicense) {
  return {
    type: consts.SELECT_PROJECT_LICENSE,
    selectedProjectLicense
  }
}