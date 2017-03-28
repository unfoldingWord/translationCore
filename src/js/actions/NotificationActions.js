import consts from './CoreActionConsts';

export const showNotification = (message, duration) => {
  return {
    type: consts.SHOW_NOTIFICATION,
    message,
    duration
  };
};

export const hideNotification = () => {
  return {
    type: consts.HIDE_NOTIFICATION
  };
};
