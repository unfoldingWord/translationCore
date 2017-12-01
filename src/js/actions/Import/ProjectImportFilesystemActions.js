/**
 * @Description:
 * Actions that call helpers to handle business logic for moving projects
**/

export const move = () => {
  return ((dispatch) => {
    dispatch({ type: 'MOVE' });
  });
};
