import {
  closeAlertDialog,
  openAlertDialog,
  openOptionDialog
} from "../actions/AlertModalActions";
import { openIgnorableAlert } from "../actions/AlertActions";

/**
 * Provides an interface for interacting with tC.
 */
export default class CoreAPI {
  constructor(dispatch) {
    this.dispatch = dispatch;
    this.showDialog = this.showDialog.bind(this);
    this.showIgnorableDialog = this.showIgnorableDialog.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.closeLoading = this.closeLoading.bind(this);
  }

  /**
   * Displays an options dialog as a promise.
   *
   * @param {string} message - the message to display
   * @param {string} confirmText - the confirm button text
   * @param {string} [cancelText] - the cancel button text
   * @return {Promise} a promise that resolves when confirmed or rejects when canceled.
   */
  showDialog(message, confirmText, cancelText = null) {
    return new Promise((resolve, reject) => {
      this.dispatch(openOptionDialog(message, (action) => {
        this.dispatch(closeAlertDialog());
        if (action === confirmText) {
          resolve();
        } else {
          reject();
        }
      }, confirmText, cancelText));
    });
  }

  /**
   * Similar to @{link onShowDialog} with the addition of it being ignorable.
   *
   * @param {string} id - The id that can be ignored. Messages that share an id will all be ignored.
   * @param {string} message - the message to display
   * @param {string} [confirmText] - confirm button text
   * @param {string} [cancelText] - cancel button text
   * @return {Promise} a promise that resolves when confirmed or rejects when canceled.
   */
  showIgnorableDialog(id, message, confirmText = null, cancelText = null) {
    return new Promise((resolve, reject) => {
      this.dispatch(openIgnorableAlert(id, message, {
        confirmText,
        cancelText,
        onConfirm: () => {
          resolve();
        },
        onCancel: () => {
          reject();
        }
      }));
    });
  }

  /**
   * Displays a loading dialog.
   * @param {string} message - the message to display while loading
   */
  showLoading(message) {
    this.dispatch(openAlertDialog(message, true));
  }

  /**
   * Closes the loading dialog.
   * TRICKY: this actually closes all dialogs right now.
   * Ideally that could change in the future.
   */
  closeLoading() {
    this.dispatch(closeAlertDialog());
  }
}
