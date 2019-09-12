import consts from './ActionTypes';

/**
 * this closes the software update dialog
 * @return {{type: string}}
 */
export function closeSoftwareUpdate() {
  return { type: consts.CLOSE_SOFTWARE_UPDATE };
}

/**
 * this opens the software update dialog
 * @return {{type: string}}
 */
export function openSoftwareUpdate() {
  return { type: consts.OPEN_SOFTWARE_UPDATE };
}
