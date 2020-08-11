import {
  closeAlertDialog,
  openAlertDialog,
  openOptionDialog,
} from '../actions/AlertModalActions';
import { openIgnorableAlert } from '../actions/AlertActions';

/**
 * Provides an interface with which tools can interact with tC.
 * TRICKY: When adding new methods don't forget to bind the method to this.
 */
export default class CoreAPI {
  constructor(dispatch) {
    this.dispatch = dispatch;
    this.showDialog = this.showDialog.bind(this);
    this.showIgnorableAlert = this.showIgnorableAlert.bind(this);
    this.showIgnorableDialog = this.showIgnorableDialog.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.closeLoading = this.closeLoading.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
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
  showIgnorableAlert(id, message, confirmText = null, cancelText = null) {
    return new Promise((resolve, reject) => {
      this.dispatch(openIgnorableAlert(id, message, {
        confirmText,
        cancelText,
        onConfirm: () => {
          resolve();
        },
        onCancel: () => {
          reject();
        },
      }));
    });
  }

  /**
   * @deprecated use {@link showIgnorableAlert} instead
   * @param args
   * @returns {Promise}
   */
  showIgnorableDialog(...args) {
    console.warn('DEPRECATED: showIgnorableDialog is deprecated. Use showIgnorableAlert instead');
    return this.showIgnorableAlert(...args);
  }

  /**
   * Displays a loading dialog.
   * @param {string} message - the message to display while loading
   */
  showLoading(message) {
    this.dispatch(openAlertDialog(message, true));
  }

  /**
   * Display an alert
   * @param {string} message - the message to display
   * @param {boolean} loading - show Loading icon or not.
   */
  showAlert(message, loading) {
    this.dispatch(openAlertDialog(message, loading));
  }

  /**
   * Closes the loading dialog.
   */
  closeLoading() {
    this.closeAlert();
  }

  /**
   * Closes the current alert dialog.
   * TRICKY: this actually closes all dialogs right now.
   * Ideally that could change in the future.
   */
  closeAlert() {
    this.dispatch(closeAlertDialog());
  }
}
