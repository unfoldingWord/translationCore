import consts from './CoreActionConsts'

export const showPopover = (title, bodyText, positionCoord) => {
  return {
    type: consts.SHOW_POPOVER,
    title,
    bodyText,
    positionCoord
  }
}

export const closePopover = () => {
  return {
    type: consts.CLOSE_POPOVER
  }
}
