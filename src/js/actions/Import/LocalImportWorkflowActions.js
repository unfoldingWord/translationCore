/**
 * @Description:
 * Actions that dispatch other actions to wrap up local importing
 *
**/

export const localImport = () => {
  return((dispatch, getState) => {
    dispatch(convert());
    dispatch(migrate());
    dispatch(validate());
    dispatch(move());
  });
};
