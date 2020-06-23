/* eslint-disable no-template-curly-in-string */
/**
 * This file contains strings that are used within the application
 * but are not eligible for translation.
 *
 * Constants must be in snake_case.
 *
 * You may access these variables like `translate('_.variable_name_in_this_file')`
 */
import appPackage from '../../package.json';

export const app_name = appPackage.productName;
export const translation_studio = 'translationStudio';
export const door43 = 'Door43';
export const autographa = 'Autographa';
export const help_desk_email = 'help@door43.org';
export const translation_helps = 'translationHelps';
export const wycliffe_associates = 'Wycliffe Associates';
export const english = 'English (en)';
export const hindi = 'हिंदी (hi)';
// TRICKY: these strings are not localized because they are sent to help desk and not displayed to the user
export const support_dcs_rename_failed = 'Door43 rename repo failed.  Could not rename repo ‘${old_repo_name}’ to ‘${new_repo_name}’ for user ‘${user_name}’';
export const support_dcs_create_new_failed = 'Door43 create new failed.  Could not create new repo ‘${new_repo_name}’ for user ‘${user_name}’';
export const support_dcs_rename_conflict = 'Door43 rename conflict.  Repo ‘${new_repo_name}’ already exists for user ‘${user_name}’';
export const support_dcs_create_new_conflict = 'Door43 "Create new repo" conflict.  Repo ‘${new_repo_name}’ already exists for user ‘${user_name}’';
