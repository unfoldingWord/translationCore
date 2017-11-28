/**
 * @Description:
 * Actions that dispatch other actions to wrap up online importing
**/

export const onlineImport = () => {
  return((dispatch, getState) => {
    dispatch(cloneRepo());
    dispatch(migrate());
    dispatch(validate());
    dispatch(move());
  });
};
