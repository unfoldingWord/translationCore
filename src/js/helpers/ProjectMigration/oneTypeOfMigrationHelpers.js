/**
 * @Description:
 * Each migration needs a separate file named appropriately to what we're migrating from
 * and helper functions created to support the migration
 */

// TODO: Plan out convention for migrations

/**
 * @Description:
 * function that conditionally runs the migration if needed
 */
export const migrate = () => {
  if (shouldRun()) run();
};

/**
 * @Description:
 * function that checks to see if the migration should be run
 */
export const shouldRun = () => {

};

/**
 * @Description:
 * function that actually runs the migration
 * should be further broken down into small modular functions
 */
export const run = () => {

};
