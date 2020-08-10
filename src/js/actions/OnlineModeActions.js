import { remote } from 'electronite';

// actions
import * as OnlineModeConfirmActions from './OnlineModeConfirmActions';

// consts
const { BrowserWindow } = remote;

/**
 * @description - Intercepts on clicks and checks for http methods
 * @param {function} dispatch - The dispatcher
 */
export function getAnchorTags() {
  return ((dispatch) => {
    document.body.onclick = (e) => {
      if (e) {
        const isLink = findParent('a', e.target || e.srcElement) && e.target.href && e.target.href.includes('http');

        if (isLink) {
          e.preventDefault();
          dispatch(OnlineModeConfirmActions.confirmOnlineAction(() => {
            let win = new BrowserWindow({ width: 800, height: 600 });

            win.on('closed', () => {
              win = null;
            });
            win.loadURL(e.target.href);
          }));
        }
      }
    };

    /**
     * @description - Find a tag parents of an element
     * @param {string} tagname - name of the a tag clicked
     * @param {object} el - element of the a tag clicked
     */
    function findParent(tagname, el) {
      if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
        return el;
      }

      while ((el = el.parentNode) !== null) {
        if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
          return el;
        }
      }
      return null;
    }
  });
}
