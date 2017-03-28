import consts from './CoreActionConsts';

export const setSaveLocation = (pathLocation) => ({
  type: consts.SET_SAVE_PATH_LOCATION,
  pathLocation
});
