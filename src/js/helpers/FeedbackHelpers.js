import os from "os";
import appPackage from "../../../package";
import axios from "axios";
import stringify from 'json-stringify-safe';
import {openAlert} from "../actions/AlertActions";
import {getTranslate} from "../selectors";
import {getQuoteAsString} from "checking-tool-wrapper";
import {changeToNextContextId} from "../actions/ContextIdActions";
import * as HomeScreenActions from "../actions/HomeScreenActions";
import * as FeedbackDialog from '../components/dialogComponents/FeedbackDialog';

/**
 *
 * @param {Object} contextId
 * @param {String} selectedGL
 * @param {Boolean} moveToNext - if true, then we move to next contextId when the user has made a selection
 * @return {Function}
 */
export const promptForInvalidCheckFeedback = (contextId, selectedGL, moveToNext) => (dispatch, getState) => {
  const translate = getTranslate(getState());
  const quoteString = getQuoteAsString(contextId.quote);
  const reference = `${contextId.reference.bookId} ${contextId.reference.chapter}:${contextId.reference.verse}`;
  const data = `\n\nTool: "${contextId.tool}"\nGroupId: "${contextId.groupId}"\nReference: "${reference}"\nGateway Language: "${selectedGL}"\nQuote: "${quoteString}"\nOccurrence: "${contextId.occurrence}"\n\n`;
  const report = data.replace(/\n/g,"<br>"); // use html line formatting
  const message = translate("tools.invalid_check_found", { report });
  console.log("promptForInvalidCheckFeedback(): " + message);
  const onSelection = () => {
    if (moveToNext) {
      dispatch(changeToNextContextId());
    }
  };
  // TODO:
  dispatch(openAlert("invalidQuote", message, {
    confirmText: translate("buttons.feedback_button"),
    cancelText: translate("buttons.ignore_button"),
    onConfirm: () => {
      console.log("promptForInvalidCheckFeedback(): User clicked submit feedback");
      dispatch(HomeScreenActions.setErrorFeedbackCategory(FeedbackDialog.CONTENT_AND_RESOURCES_FEEDBACK_KEY));
      dispatch(HomeScreenActions.setErrorFeedbackMessage('There is a problem with the content of this check:' + data)); // put up feedback dialog
      onSelection();
    },
    onCancel: () => {
      console.log("promptForInvalidCheckFeedback(): User clicked ignore");
      onSelection();
    }
  }));
};

/**
 * Submits a new support ticket.
 * If the response is 401 the user is not registered and you should supply
 * a `name` in order to create the account.
 *
 * @param {string} category - the support category
 * @param {string} message - the user's feedback
 * @param {string} [name] - the user's name. Only use this if you need to create a new support account.
 * @param {string} email - the email opening this ticket
 * @param {object} [state] - the application state. If this is set both the state and system information will be submitted.
 * @return {AxiosPromise}
 */
export const submitFeedback = ({ category, message, name, email, state }) => {
  const osInfo = {
    arch: os.arch(),
    cpus: os.cpus(),
    memory: os.totalmem(),
    type: os.type(),
    networkInterfaces: os.networkInterfaces(),
    loadavg: os.loadavg(),
    eol: os.EOL,
    userInfo: os.userInfo(),
    homedir: os.homedir(),
    platform: os.platform(),
    release: os.release()
  };

  let fromContact = {
    email: process.env.TC_HELP_DESK_EMAIL,
    name: 'Help Desk'
  };
  if(email) {
    fromContact = {
      email,
      name: name ? name : email
    };
  }

  let fullMessage = `${message}\n\nApp Version:\n${appPackage.version} (${process.env.BUILD})`;
  if(name) {
    fullMessage += `\n\nName: ${name}`;
  }
  if(email) {
    fullMessage += `\n\nEmail: ${email}`;
  }
  if (state) {
    const stateString = stringifySafe(state, "[error loading state]");
    const osString = stringifySafe(osInfo,
      "[error loading system information]");
    fullMessage += `\n\nSystem Information:\n${osString}\n\nApp State:\n${stateString}`;
  }

  const request = {
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    headers: {
      Authorization: `Bearer ${process.env.TC_HELP_DESK_TOKEN}`
    },
    data: {
      "personalizations": [
        {
          "to": [
            {
              email: process.env.TC_HELP_DESK_EMAIL,
              name: "Help Desk"
            }
          ],
          subject: `tC: ${category}`
        }
      ],
      "from": fromContact,
      "reply_to": fromContact,
      "content": [
        { type: "text/plain", value: fullMessage },
        { type: "text/html", value: fullMessage.replace(/\n/g, "<br>") }
      ]
    }
  };
  //
  // if (name) {
  //   request.data.user_name = name;
  // }

  return axios(request);
};

/**
 * Safely converts a json object to a string.
 * This will handle circular object as well
 * @param json
 * @param error
 * @return {string}
 */
export const stringifySafe = (json, error=null) => {
  try {
    return stringify(json);
  } catch (e) {
    if(error) {
      return error;
    } else {
      return e.message;
    }
  }
};

/**
 * Checks if the feedback response indicates the user is not registered.
 * @deprecated - we no longer need to check if users are registered because we now provide sufficient information to register their new account in the initial request.
 * @param {object} response - the error.response given by axios
 * @return {bool}
 */
export const isNotRegistered = (response) => {
  const { data } = response;
  const expectedResponse = "user not registered";
  const notRegistered = Boolean(data) && Boolean(data.error) &&
    data.error.toLowerCase().includes(expectedResponse);
  return response.status === 401 && notRegistered;
};
