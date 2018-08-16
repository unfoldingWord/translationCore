import os from "os";
import appPackage from "../../../package";
import axios from "axios";
import stringify from 'json-stringify-safe';

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
