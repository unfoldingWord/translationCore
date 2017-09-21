/**
 * @description This helper method generates a timestamp in milliseconds for use
 *              in the storing of data in the app. Timestamps will be used to
 *              generate filenames and modified dates.
 * @return {Integer} The timestamp in milliseconds
 ******************************************************************************/
export const generateTimestamp = () => {
  return (new Date()).toJSON();
};
