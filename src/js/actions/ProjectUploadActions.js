import React from "react";
import path from "path-extra";
import open from "open";
import Repo from "../helpers/Repo.js";
import { getTranslate } from "../selectors";
// actions
import * as AlertModalActions from "./AlertModalActions";
import * as OnlineModeConfirmActions from "./OnlineModeConfirmActions";
import * as WordAlignmentActions from "./WordAlignmentActions";
// helpers
import * as GogsApiHelpers from "../helpers/GogsApiHelpers";

/**
 * Upload project to door 43, based on currently logged in user.
 * @param {String} projectPath - Path to the project to upload
 * @param {Object} user - currently logged in user
 * @param {Boolean} onLine - if undefined in function call it will equal to
 * navigator.onLine. This is useful to unit test.
 */
export function uploadProject(projectPath, user, onLine = navigator.onLine) {
  return (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      // if no Internet connection is found then alert the user and stop upload process
      if (!onLine) {
        dispatch(AlertModalActions.openAlertDialog(translate("no_internet")));
        resolve();
      } else if (!user.localUser) {
        dispatch(OnlineModeConfirmActions.confirmOnlineAction(async () => {
          const projectName = projectPath.split(path.sep).pop();
          try {
            if (!user.token) {
              const message = translate("users.session_invalid");
              return dispatch(
                AlertModalActions.openAlertDialog(message, false));
            }
            const filePath = path.join(projectPath, projectName + ".usfm");
            await dispatch(
              WordAlignmentActions.getUsfm3ExportFile(projectPath, filePath));
            const message = translate("projects.uploading_alert",
              { project_name: projectName, door43: translate("_.door43") });
            dispatch(AlertModalActions.openAlertDialog(message, true));
            const remoteRepo = await GogsApiHelpers.createRepo(user,
              projectName);
            const remoteUrl = GogsApiHelpers.getRepoOwnerUrl(user,
              remoteRepo.name);

            const repo = new Repo(projectPath, user);
            await repo.addRemote(remoteUrl, "origin");
            await repo.save("Commit before upload");

            const response = await repo.push("origin");
            if (response.errors && response.errors.length) {
              // Handle innocuous errors.
              console.error(response);
              dispatch(AlertModalActions.openAlertDialog(
                translate("projects.uploading_error",
                  { error: response.errors })));

            } else {
              const userDcsUrl = GogsApiHelpers.getUserDoor43Url(user,
                projectName);
              dispatch(
                AlertModalActions.openAlertDialog(
                  <div>
                    <span>
                      <span style={{ fontWeight: "bold" }}>{user.username +
                      ", "}</span>
                      {translate("projects.upload_successful_alert",
                        { username: user.username })}&nbsp;
                      <a style={{ cursor: "pointer" }} onClick={() => {
                        dispatch(
                          OnlineModeConfirmActions.confirmOnlineAction(() => {
                            open(userDcsUrl);
                          }));
                      }}>
                        {userDcsUrl}
                      </a>
                    </span>
                  </div>
                )
              );
            }
          } catch (err) {
            // handle server and networking errors
            console.error(err);
            if (err.status === 401 || err.code === "ENOTFOUND" ||
              err.toString().includes("connect ETIMEDOUT") ||
              err.toString().includes("INTERNET_DISCONNECTED") ||
              err.toString().includes("unable to access") ||
              err.toString().includes("The remote end hung up")) {
              const message = translate("no_internet");
              dispatch(AlertModalActions.openAlertDialog(message));
            } else if (err.toString().includes(
              "not a simple fast-forward")) {
              const message = translate("projects.upload_modified_error",
                { project_name: projectName, door43: translate("_.door43") });
              dispatch(AlertModalActions.openAlertDialog(message));
            } else if (err.hasOwnProperty("message")) {
              dispatch(AlertModalActions.openAlertDialog(
                translate("projects.uploading_error",
                  { error: err.message })));
            } else if (err.hasOwnProperty("data") && err.data) {
              dispatch(AlertModalActions.openAlertDialog(
                translate("projects.uploading_error", { error: err.data })));
            } else {
              dispatch(
                AlertModalActions.openAlertDialog(err.message || err, false));
            }
            resolve();
          }
        }));
      } else {
        const message = translate("projects.must_be_logged_in_alert",
          { door43: translate("_.door43") });
        dispatch(AlertModalActions.openAlertDialog(message));
        resolve();
      }
    });
  };
}
