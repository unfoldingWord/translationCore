import consts from './ActionTypes';

export const showPopover = (title, bodyText, positionCoord, style = {}, titleStyle = {}, bodyStyle = {}) => ({
  type: consts.SHOW_POPOVER,
  title,
  bodyText,
  positionCoord,
  style,
  titleStyle,
  bodyStyle,
});

export const closePopover = () => ({ type: consts.CLOSE_POPOVER });
