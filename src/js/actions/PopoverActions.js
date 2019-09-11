import consts from './ActionTypes';

export const showPopover = (title, bodyText, positionCoord) => ({
  type: consts.SHOW_POPOVER,
  title,
  bodyText,
  positionCoord,
});

export const closePopover = () => ({ type: consts.CLOSE_POPOVER });
