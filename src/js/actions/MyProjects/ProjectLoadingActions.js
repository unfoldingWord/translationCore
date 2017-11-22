/**
 * @Description:
 * Actions that dispatch other actions to wrap up loading projects
**/

/**
 * @Description: action that Migrates, Validates and Loads the Project
 * This may seem redundant to run migrations and validations each time
 * But the helpers called from each action test to only run when needed
**/
export const migrateValidateLoadProject = () => {
  return((dispatch, getState) => {
    dispatch(migrate());
    dispatch(validate());
    dispatch(loadProject());
  });
};
