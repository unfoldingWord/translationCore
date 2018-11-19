/**
 * @description This helper method generates a timestamp in milliseconds for use
 *              in the storing of data in the app. Timestamps will be used to
 *              generate filenames and modified dates.
 * @param {String} str A date string. If null, will be current date
 * @return {String} The timestamp in milliseconds
 ******************************************************************************/
export const generateTimestamp = (str) => {
  if (!str) {
    return (new Date()).toJSON();
  } else {
    return (new Date(str)).toJSON();
  }
};
